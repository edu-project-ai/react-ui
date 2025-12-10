import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type LearningPathsFilter = "all" | "active" | "completed";
export type LearningPathsSortBy = "date" | "progress" | "title";

interface LearningPathsState {
  filter: LearningPathsFilter;
  sortBy: LearningPathsSortBy;
  sortOrder: "asc" | "desc";
  selectedPathId: string | null;
  expandedCheckpoints: string[];
}

const initialState: LearningPathsState = {
  filter: "all",
  sortBy: "date",
  sortOrder: "desc",
  selectedPathId: null,
  expandedCheckpoints: [],
};

const learningPathsSlice = createSlice({
  name: "learningPaths",
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<LearningPathsFilter>) => {
      state.filter = action.payload;
    },
    setSortBy: (state, action: PayloadAction<LearningPathsSortBy>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<"asc" | "desc">) => {
      state.sortOrder = action.payload;
    },
    toggleSortOrder: (state) => {
      state.sortOrder = state.sortOrder === "asc" ? "desc" : "asc";
    },
    setSelectedPathId: (state, action: PayloadAction<string | null>) => {
      state.selectedPathId = action.payload;
    },
    toggleCheckpointExpanded: (state, action: PayloadAction<string>) => {
      const checkpointId = action.payload;
      const index = state.expandedCheckpoints.indexOf(checkpointId);
      if (index === -1) {
        state.expandedCheckpoints.push(checkpointId);
      } else {
        state.expandedCheckpoints.splice(index, 1);
      }
    },
    expandAllCheckpoints: (state, action: PayloadAction<string[]>) => {
      state.expandedCheckpoints = action.payload;
    },
    collapseAllCheckpoints: (state) => {
      state.expandedCheckpoints = [];
    },
    resetFilters: (state) => {
      state.filter = "all";
      state.sortBy = "date";
      state.sortOrder = "desc";
    },
  },
});

export const {
  setFilter,
  setSortBy,
  setSortOrder,
  toggleSortOrder,
  setSelectedPathId,
  toggleCheckpointExpanded,
  expandAllCheckpoints,
  collapseAllCheckpoints,
  resetFilters,
} = learningPathsSlice.actions;

export default learningPathsSlice.reducer;
