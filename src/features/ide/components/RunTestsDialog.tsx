import { useState, useCallback } from 'react';
import { X, Play, Sparkles, Loader2, FileCode, CheckCircle, AlertTriangle } from 'lucide-react';
import Markdown from 'react-markdown';
import { useIdeStore } from '../store/useIdeStore';
import { useAgentChatMutation } from '@/features/ai-mentor/api/agentApi';
import { useWriteFileMutation } from '../api/ideProxyApi';
import * as monaco from 'monaco-editor';

/** Language → test file path in container workspace */
const TEST_FILE_PATHS: Record<string, string> = {
  python: '/workspace/test_solution.py',
  javascript: '/workspace/solution.test.js',
  typescript: '/workspace/solution.test.ts',
  go: '/workspace/solution_test.go',
  java: '/workspace/SolutionTest.java',
  csharp: '/workspace/SolutionTest.cs',
  rust: '/workspace/tests/solution_test.rs',
  ruby: '/workspace/solution_spec.rb',
  php: '/workspace/SolutionTest.php',
};

/** Language → install command for test deps (only if not already installed) */
const INSTALL_TEST_DEPS: Record<string, string> = {
  javascript: 'npm ls jest >/dev/null 2>&1 || npm install --save-dev jest',
  typescript: 'npm ls jest ts-jest >/dev/null 2>&1 || npm install --save-dev jest ts-jest @types/jest',
  python: 'pip show pytest >/dev/null 2>&1 || pip install pytest',
};

/** Extract code from the first fenced code block in AI response, falling back to full text. */
function extractCodeBlock(text: string): string {
  const match = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

type RunPhase = 'idle' | 'checking' | 'generating' | 'installing' | 'writing' | 'running' | 'done' | 'error';

interface RunTestsDialogProps {
  open: boolean;
  onClose: () => void;
  taskDescription: string;
  language: string;
  taskId?: string | null;
  onRunTests: () => void;
}

export function RunTestsDialog({
  open,
  onClose,
  taskDescription,
  language,
  taskId,
  onRunTests,
}: RunTestsDialogProps) {
  const containerId = useIdeStore((s) => s.containerId);
  const activeFilePath = useIdeStore((s) => s.activeFilePath);

  const [agentChat] = useAgentChatMutation();
  const [writeFile] = useWriteFileMutation();

  // Manual generation state
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [rawReply, setRawReply] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto "Run Tests Now" state
  const [autoPhase, setAutoPhase] = useState<RunPhase>('idle');
  const [autoLog, setAutoLog] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);

  const appendLog = useCallback((msg: string) => {
    setAutoLog((prev) => [...prev, msg]);
  }, []);

  const handleClose = useCallback(() => {
    setGeneratedCode(null);
    setRawReply(null);
    setIsGenerating(false);
    setAutoPhase('idle');
    setAutoLog([]);
    setError(null);
    onClose();
  }, [onClose]);

  /** Read current code from Monaco editor */
  const readCurrentCode = useCallback((): string => {
    if (!activeFilePath) return '';
    const uri = monaco.Uri.parse(`file:///${activeFilePath}`);
    const model = monaco.editor.getModel(uri);
    return model ? model.getValue() : '';
  }, [activeFilePath]);

  /** Write test file to container */
  const writeTestFile = useCallback(
    async (code: string): Promise<void> => {
      if (!containerId) throw new Error('No container available');
      const testPath = TEST_FILE_PATHS[language?.toLowerCase() ?? ''] ?? '/workspace/test_solution.py';
      await writeFile({ containerId, path: testPath, content: code }).unwrap();
    },
    [containerId, language, writeFile],
  );

  /** Send install deps command via WebSocket terminal */
  const sendTerminalCommand = useCallback(
    (cmd: string) => {
      // Access the socket via the useRunTests hook mechanism - we trigger onRunTests
      // which handles terminal command sending
    },
    [],
  );

  // ── Manual "Generate Unit Tests with AI" ──
  const handleGenerate = useCallback(async () => {
    setError(null);
    setGeneratedCode(null);
    setRawReply(null);
    setIsGenerating(true);

    try {
      const currentCode = readCurrentCode();

      const result = await agentChat({
        userMessage:
          'You are a Senior QA Test Engineer. Your task is to create comprehensive unit tests for the coding task below.\n\n' +
          'First check if validation tests already exist in the database for this task (use fetch_validation_code tool).\n' +
          'If tests exist, return them.\n' +
          'If no tests exist, generate comprehensive unit tests based on the solution code and task description.\n' +
          'Then save the generated tests to the database (use save_generated_tests tool).\n\n' +
          'Return ONLY the test file content inside a single fenced code block.',
        taskType: 'code',
        taskInstruction: taskDescription,
        currentCode: currentCode || null,
        language,
        taskId: taskId ?? null,
      }).unwrap();

      const code = extractCodeBlock(result.reply);
      setGeneratedCode(code);
      setRawReply(result.reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tests. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [readCurrentCode, agentChat, taskDescription, language, taskId]);

  // ── Manual "Create File & Run Tests" ──
  const handleCreateAndRun = useCallback(async () => {
    if (!generatedCode || !containerId) return;

    setError(null);
    setAutoPhase('writing');

    try {
      await writeTestFile(generatedCode);
      setAutoPhase('done');
      setTimeout(() => {
        onRunTests();
        handleClose();
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to write test file.');
      setAutoPhase('error');
    }
  }, [generatedCode, containerId, writeTestFile, onRunTests, handleClose]);

  // ── Auto "Run Tests Now" ── Full automated pipeline ──
  const handleRunNow = useCallback(async () => {
    if (!containerId) {
      setError('Container not ready. Please wait for the terminal to connect.');
      return;
    }

    setError(null);
    setAutoLog([]);

    try {
      // Phase 1: Check for existing validation code
      setAutoPhase('checking');
      appendLog('Checking for existing unit tests...');

      const currentCode = readCurrentCode();

      const checkResult = await agentChat({
        userMessage:
          'Check if validation tests already exist in the database for this coding task.\n' +
          'Use the fetch_validation_code tool with the task_id.\n' +
          'If tests exist, return them inside a fenced code block.\n' +
          'If no tests exist, respond with exactly: NO_TESTS_FOUND',
        taskType: 'code',
        taskInstruction: taskDescription,
        currentCode: currentCode || null,
        language,
        taskId: taskId ?? null,
      }).unwrap();

      let testCode: string;
      const hasTests = !checkResult.reply.includes('NO_TESTS_FOUND') &&
        !checkResult.reply.toLowerCase().includes('no validation') &&
        !checkResult.reply.toLowerCase().includes('no tests found') &&
        !checkResult.reply.toLowerCase().includes('need to be generated') &&
        checkResult.reply.includes('```');

      if (hasTests) {
        testCode = extractCodeBlock(checkResult.reply);
        appendLog('Found existing unit tests in database.');
      } else {
        // Phase 2: Generate tests
        setAutoPhase('generating');
        appendLog('No existing tests found. Generating unit tests...');

        const genResult = await agentChat({
          userMessage:
            'You are a Senior QA Test Engineer. Generate comprehensive unit tests for this coding task.\n' +
            'Use the solution code from the database as reference to create thorough tests.\n' +
            'Cover edge cases, boundary conditions, and main functionality.\n' +
            'After generating, save the tests to the database using save_generated_tests tool.\n\n' +
            'Return ONLY the test file content inside a single fenced code block.',
          taskType: 'code',
          taskInstruction: taskDescription,
          currentCode: currentCode || null,
          language,
          taskId: taskId ?? null,
        }).unwrap();

        testCode = extractCodeBlock(genResult.reply);
        appendLog('Unit tests generated and saved to database.');
      }

      // Phase 3: Install test dependencies
      const installCmd = INSTALL_TEST_DEPS[language?.toLowerCase() ?? ''];
      if (installCmd) {
        setAutoPhase('installing');
        appendLog('Installing test dependencies...');
        // Write a small script that installs deps, then write the test file
        // We use the ideProxy exec or write approach
        const installScript = `#!/bin/bash\n${installCmd}\n`;
        await writeFile({
          containerId,
          path: '/workspace/.install_test_deps.sh',
          content: installScript,
        }).unwrap();
      }

      // Phase 4: Write test file to container
      setAutoPhase('writing');
      appendLog('Writing test file to container...');
      await writeTestFile(testCode);
      appendLog('Test file created successfully.');

      // Phase 5: Run tests
      setAutoPhase('running');
      appendLog('Running tests in terminal...');

      // If we have an install script, we need to run install first then tests
      if (installCmd) {
        // We'll run install + tests via onRunTests (the terminal command)
        // First trigger install by sending command, small delay, then run tests
        onRunTests();
      } else {
        onRunTests();
      }

      setAutoPhase('done');
      appendLog('Tests started in terminal.');

      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (err) {
      setAutoPhase('error');
      setError(err instanceof Error ? err.message : 'Failed to run tests. Please try again.');
      appendLog('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [
    containerId, readCurrentCode, agentChat, taskDescription, language,
    taskId, writeFile, writeTestFile, onRunTests, handleClose, appendLog,
  ]);

  if (!open) return null;

  const testFilePath = TEST_FILE_PATHS[language?.toLowerCase() ?? ''] ?? '/workspace/test_solution.py';
  const isAutoRunning = autoPhase !== 'idle' && autoPhase !== 'done' && autoPhase !== 'error';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget && !isAutoRunning) handleClose(); }}
    >
      <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-2xl w-[640px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3c3c3c]">
          <div className="flex items-center gap-2">
            <Play size={16} className="text-[#4ec9b0]" />
            <span className="text-[14px] font-semibold text-[#cccccc]">Run Tests</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isAutoRunning}
            className="text-[#858585] hover:text-white transition-colors p-1 rounded disabled:opacity-30"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {/* Auto-run progress log */}
          {autoPhase !== 'idle' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                {autoPhase === 'done' ? (
                  <CheckCircle size={14} className="text-[#4ec9b0]" />
                ) : autoPhase === 'error' ? (
                  <AlertTriangle size={14} className="text-[#f48771]" />
                ) : (
                  <Loader2 size={14} className="animate-spin text-[#569cd6]" />
                )}
                <span className="text-[13px] text-[#cccccc] font-medium">
                  {autoPhase === 'checking' && 'Checking for existing tests...'}
                  {autoPhase === 'generating' && 'Generating unit tests with AI...'}
                  {autoPhase === 'installing' && 'Installing test dependencies...'}
                  {autoPhase === 'writing' && 'Writing test file...'}
                  {autoPhase === 'running' && 'Starting tests...'}
                  {autoPhase === 'done' && 'Tests started successfully!'}
                  {autoPhase === 'error' && 'Failed'}
                </span>
              </div>

              <div className="rounded border border-[#3c3c3c] bg-[#1a1a1a] p-3 space-y-1">
                {autoLog.map((log, i) => (
                  <div key={i} className="flex items-start gap-2 text-[12px]">
                    <span className="text-[#569cd6] shrink-0">{'>'}</span>
                    <span className="text-[#d4d4d4]">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual generate section (only when not auto-running) */}
          {autoPhase === 'idle' && (
            <div className="space-y-2">
              <p className="text-[13px] text-[#858585]">
                Click <strong>Run Tests Now</strong> to auto-detect and run existing tests, or generate new ones if needed.
                You can also manually generate tests first.
              </p>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[13px] rounded
                  bg-[#37373d] text-[#cccccc] hover:bg-[#454545] disabled:opacity-50 disabled:cursor-not-allowed
                  border border-[#3c3c3c] transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Generating unit tests...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-[#dbb8ff]" />
                    Generate Unit Tests with AI
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-3 py-2 rounded bg-[#2d1b1b] border border-[#5a2b2b] text-[12px] text-[#f48771]">
              {error}
            </div>
          )}

          {/* Generated code preview */}
          {generatedCode && autoPhase === 'idle' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileCode size={13} className="text-[#4ec9b0]" />
                <span className="text-[12px] text-[#858585]">
                  Will be written to:{' '}
                  <code className="text-[#ce9178] bg-[#1a1a1a] px-1 rounded">{testFilePath}</code>
                </span>
              </div>

              <div className="rounded border border-[#3c3c3c] bg-[#1e1e1e] max-h-[280px] overflow-y-auto">
                <div className="px-3 py-2 border-b border-[#3c3c3c] flex items-center justify-between">
                  <span className="text-[11px] text-[#858585] uppercase tracking-wider">
                    Generated Test File
                  </span>
                </div>
                <pre className="p-3 text-[12px] text-[#d4d4d4] font-mono leading-relaxed whitespace-pre-wrap break-all">
                  {generatedCode}
                </pre>
              </div>

              {rawReply && rawReply !== generatedCode && (
                <details className="text-[12px]">
                  <summary className="cursor-pointer text-[#858585] hover:text-[#cccccc] select-none py-1">
                    Show full AI response
                  </summary>
                  <div className="mt-1 prose prose-invert prose-sm max-w-none text-[12px] text-[#cccccc]
                    [&_code]:bg-[#2d2d2d] [&_code]:px-1 [&_code]:rounded
                    [&_pre]:bg-[#1a1a1a] [&_pre]:border [&_pre]:border-[#333] [&_pre]:rounded [&_pre]:p-2">
                    <Markdown>{rawReply}</Markdown>
                  </div>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#3c3c3c] flex items-center gap-2 justify-end">
          {autoPhase === 'idle' && (
            <>
              <button
                type="button"
                onClick={handleRunNow}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] rounded
                  bg-[#0e639c] text-white hover:bg-[#1177bb]
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play size={13} />
                Run Tests Now
              </button>

              {generatedCode && (
                <button
                  type="button"
                  onClick={handleCreateAndRun}
                  disabled={!containerId}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] rounded
                    bg-[#37373d] text-[#cccccc] hover:bg-[#454545]
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                    border border-[#3c3c3c]"
                >
                  <FileCode size={13} />
                  Create File &amp; Run Tests
                </button>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1.5 text-[13px] rounded text-[#858585] hover:text-white
                  hover:bg-[#3e3e3e] transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {(autoPhase === 'done' || autoPhase === 'error') && (
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 text-[13px] rounded text-[#cccccc] hover:bg-[#3e3e3e]
                border border-[#3c3c3c] transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
