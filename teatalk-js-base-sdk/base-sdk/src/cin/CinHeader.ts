/**
 * Created by H5 on 2020/3/4.
 */
// import { byte, bytes } from "./../ByteWrapper";

export class CinHeader {
    id: string;
    value: number | string | number[];

    constructor(id: string, val: number | string | number[]) {
        this.id = id;
        this.value = val;
    }
}