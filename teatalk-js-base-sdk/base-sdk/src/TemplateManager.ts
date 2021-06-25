/**
 * Created by H5 on 2020/3/8.
 */

export class TemplateManager {
    static templateStore: any = {};
    static templateRegistry: any = {};

    static loadTemplates(moduleId: string, templates: any): void {
        for (let templateName in templates) {
            let template = templates[templateName];
            if (this.templateStore[templateName]) {
                console.error(templateName + "模板定义重复：" + this.templateStore[templateName] + " 来自模块：" + moduleId, template);
                continue;
            }
            this.templateStore[templateName] = {
                module: moduleId,
                define: template
            };
        }
    }

    static registerTemplate(index: string, templateName: string): void {
        this.templateRegistry[index] = templateName;
    }

    static getTemplate(index: string, direction?: string): any {
        let name = this.templateRegistry[index];
        if (!name && direction) {
            name = this.templateRegistry[index + "_" + direction];
        }
        if (!name) {
            return null;
        }
        return this.getTemplateByName(name);
    }

    static getTemplateByName(name: string): any {
        return this.templateStore[name];
    }
}

declare global {
    interface Window {
        templateStore: any;
        templateRegistry: any;
    }
}
window.templateStore = TemplateManager.templateStore;
window.templateRegistry = TemplateManager.templateRegistry;