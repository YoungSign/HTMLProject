/**
 * Created by H5 on 2020/3/4.
 */
import { CinSubMessage } from "./CinSubMessage";

export class CinBody {
    id: string;
    value: number | string | number[] | CinSubMessage;

    constructor(id: string, val: number | string | number[] | CinSubMessage) {
        this.id = id;
        this.value = val;
    }
}