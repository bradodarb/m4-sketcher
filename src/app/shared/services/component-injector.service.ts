
import { Injectable, Component, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef, ComponentFactory } from '@angular/core';

@Injectable()
export class ComponentInjectorService<T>{

  private factory: ComponentFactory<T>;
  public instances: Array<ComponentRef<T>>;
  constructor(component: { new (): T }, componentFactoryResolver: ComponentFactoryResolver) {
    this.factory = componentFactoryResolver.resolveComponentFactory<T>(component);
  }

  injectInto(target: ViewContainerRef) {
    const result = target.createComponent<T>(this.factory);
    const index = this.instances.length;
    result.onDestroy(comp => {
      console.log('Component Destroyed', comp);
      if (comp) {
        const index = this.instances.indexOf(comp);
        this.removeFromCollection(index);
      }
    })
    this.instances.push(result);
    return { instance: result, index: index };
  }

  destroy(instance: ComponentRef<T>) {
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
