type Ctor<T = any> = {
  new (...args: any[]): T;
};

type TraitImpl<T, O extends object> = (self: O) => T;

export type TraitInstance<T, O extends object = any> = {
  <I extends O>(target: I): T | undefined;
  impl: <C extends Ctor<O>>(
    target: C,
    impl?: TraitImpl<T, InstanceType<C>>
  ) => TraitInstance<T, O>;
  has: (target: unknown) => boolean;
};

export function Trait<O extends object, T>(defaultImpl: TraitImpl<T, O>): TraitInstance<T, O> {
  const implMap: WeakMap<Ctor, TraitImpl<T, any> | undefined> = new WeakMap();
  const implMemo: WeakMap<object, T> = new WeakMap();

  const trait: TraitInstance<T, O> = target => {
    if (!implMap.has(target.constructor as Ctor)) return undefined;
    if (!implMemo.has(target)) {
      const impl = implMap.get(target.constructor as Ctor) ?? defaultImpl;
      const instance = impl(target);
      implMemo.set(target, instance);
    }
    return implMemo.get(target)!;
  };

  trait.impl = (target, impl) => {
    implMap.set(target, impl);
    return trait;
  };

  trait.has = target => {
    if (!target) return false;
    if (typeof target === 'function') {
      return implMap.has(target as Ctor);
    }
    return implMap.has(target.constructor as Ctor);
  };

  return trait;
}
