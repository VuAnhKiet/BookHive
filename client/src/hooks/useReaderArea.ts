import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setReaderArea } from '../store/readerAreaSlice';

export function useReaderArea() {
  const dispatch = useAppDispatch();
  const selectedLocation = useAppSelector(
    (state) => state.readerArea.selectedLocation,
  );

  return {
    selectedLocation,
    selectLocation: (location: string) => dispatch(setReaderArea(location)),
  };
}
