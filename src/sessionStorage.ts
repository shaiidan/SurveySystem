
const KEY_NAME = "survy-system";

export const  loadFromSessionStorage = <T>(key: string): T | undefined | null => {
    try {
      if (key) {
        let storageData: any = JSON.parse(sessionStorage.getItem(KEY_NAME) || "[]");
        let value = storageData.find((i:any) => i?.key == key);
        return value ? value.data : undefined;
      }
      return undefined;
    } catch (e) {
      return null;
    }
  }

  export const saveToSessionStorae = <T>(key: string, data: T): void  => {
    try {
      let x = { key, data };
      let storageData: any = JSON.parse(sessionStorage.getItem(KEY_NAME) || "[]");
      let isExist = storageData.some((i :any) => i?.key == key);
      if (isExist) { //update current value
        storageData.forEach((x :any)=> {
          if (x?.key == key) {
            x.data = data;
          }
        });
      }
      else {
        storageData.push(x);
      }

      sessionStorage.setItem(KEY_NAME, JSON.stringify(storageData));
    } catch (e) {
    }
  }

  export const deleteItemFromSessionStorage = (key: string) => {
    try {
      let storageData: any = JSON.parse(sessionStorage.getItem(KEY_NAME) || "[]");
      storageData = storageData.filter((i:any) => i?.key !== key);

      sessionStorage.setItem(KEY_NAME, JSON.stringify(storageData));
    } catch (e) {
      console.error('Error saving to sessionStorage', e);
    }
  }

  export const clearAppStorageData = (): void  => {
    sessionStorage.removeItem(KEY_NAME);
  }