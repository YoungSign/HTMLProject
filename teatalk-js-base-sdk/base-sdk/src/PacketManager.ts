
export let PacketManager = {
    packetDefines: {},
    setDefine: function(id: string, define: any): void {
        this.packetDefines[id] = define;
    },
    getDefine: function(id: string, direction?: string): any {
        let define = this.packetDefines[id];
        if (!define && direction) {
            define = this.packetDefines[id + "_" + direction];
        }
        return define;
    }
};

declare global {
    interface Window {
        packetDefines: any;
    }
}
window.packetDefines = PacketManager.packetDefines;