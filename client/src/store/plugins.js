import { STORAGE_KEY } from "./mutations";

const localStoragePlugin = store => {
  store.subscribe((mutation, state) => {
    const persistedData = {
      authToken: state.authToken
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedData));
  });
};

export default [localStoragePlugin];
