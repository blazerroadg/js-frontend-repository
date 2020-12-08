import { AppReducerService } from './AppReducerService';

export class ReducerServices {
    public static _instance: ReducerServices;

    public static instance(): ReducerServices {
      if (!ReducerServices._instance) {
        ReducerServices._instance = new ReducerServices();
      }
      return ReducerServices._instance;
    }

    app: AppReducerService = new AppReducerService();

    private constructor() {

    }
}
