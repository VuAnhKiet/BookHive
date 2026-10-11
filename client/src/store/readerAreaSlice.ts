import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const READER_AREA_KEY = 'bookhive-reader-area';

type ReaderAreaState = {
  selectedLocation: string;
};

const initialState: ReaderAreaState = {
  selectedLocation:
    typeof window === 'undefined'
      ? ''
      : window.localStorage.getItem(READER_AREA_KEY) ?? '',
};

const readerAreaSlice = createSlice({
  name: 'readerArea',
  initialState,
  reducers: {
    setReaderArea(state, action: PayloadAction<string>) {
      state.selectedLocation = action.payload;
    },
  },
});

export const { setReaderArea } = readerAreaSlice.actions;
export { READER_AREA_KEY };
export default readerAreaSlice.reducer;
