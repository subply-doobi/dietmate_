import { configureStore } from "@reduxjs/toolkit";

import userInputReducer from "../../features/reduxSlices/userInputSlice";
import sortFilterReducer from "../../features/reduxSlices/sortFilterSlice";
import commonReducer from "../../features/reduxSlices/commonSlice";
import orderReducer from "../../features/reduxSlices/orderSlice";
import modalReducer from "../../features/reduxSlices/modalSlice";
import autoMenuReducer from "../../features/reduxSlices/autoMenuSlice";
import filteredProductReducer from "../../features/reduxSlices/filteredPSlice";
import formulaReducer from "../../features/reduxSlices/formulaSlice";

export const store = configureStore({
  reducer: {
    userInput: userInputReducer,
    common: commonReducer,
    formula: formulaReducer,
    sortFilter: sortFilterReducer,
    filteredProduct: filteredProductReducer,
    autoMenu: autoMenuReducer,
    order: orderReducer,
    modal: modalReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
