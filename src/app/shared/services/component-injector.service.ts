
import { Injectable, Component, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef, ComponentFactory } from '@angular/core';

@Injectable()
export class ComponentInjectorService {

  public instances: Array<any> = new Array<any>();
  constructor(private componentFactoryResolver: ComponentFactoryResolver) {

  }

  injectInto(component, target: ViewContainerRef): any {
    const factory = this.componentFactoryResolver.resolveComponentFactory(component);
    const result = target.createComponent(factory);
    const index = this.instances.length;
    result.onDestroy(comp => {
      console.log('Component Destroyed', comp);
      if (result) {
        const index = this.instances.indexOf(result);
        this.removeFromCollection(index);
      }
    })
    this.instances.push(result);
    return result;
  }

  destroy<T>(instance: ComponentRef<T>) {
    const index = this.instances.indexOf(instance);
    if (index > -1) {
      this.instances[index].destroy();
      this.removeFromCollection(index);
    }
  }

  private removeFromCollection(index) {
    if (index > -1) {
      this.instances.splice(index, 1);
    }
  }

}
