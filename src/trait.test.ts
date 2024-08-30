import { Trait, TraitInstance } from './trait.js';
import assert from 'node:assert';
import { describe, test, beforeEach } from 'node:test';

describe('Trait', () => {
  type TraitTarget = { name: string };
  type AnimalTrait = {
    make_sound: () => string;
  };
  type CanSwimTrait = {
    swim: () => string;
  };

  let Animal: TraitInstance<AnimalTrait, TraitTarget>;
  let CanSwim: TraitInstance<CanSwimTrait, TraitTarget>;

  class Dog {
    constructor(public name: string) {}
  }

  class Cat {
    constructor(public name: string) {}
  }

  beforeEach(() => {
    Animal = Trait<TraitTarget, AnimalTrait>(self => {
      return {
        make_sound: () => `${self.name} aaa!`
      };
    });
    CanSwim = Trait<TraitTarget, CanSwimTrait>(self => {
      return {
        swim: () => `${self.name} is swimming!`
      };
    });
  });

  test('Basic Trait Application', () => {
    Animal.impl(Dog);
    const dog = new Dog('Jack');

    const animalTrait = Animal(dog);
    assert(animalTrait, 'Animal trait should be defined');
    assert.strictEqual(animalTrait?.make_sound(), 'Jack aaa!');
  });

  test('Custom Trait Implementation', () => {
    Animal.impl(Cat, cat => ({
      make_sound: () => `${cat.name} meows!`
    }));
  
    const cat = new Cat('Bart');
  
    const animalTrait = Animal(cat);
    assert(animalTrait, 'Animal trait should be defined');
    assert.strictEqual(animalTrait?.make_sound(), 'Bart meows!');
  });

  test('Multiple Traits per Class', () => {
    Animal.impl(Dog);
    CanSwim.impl(Dog);
    const dog = new Dog('Jack');
  
    const animalTrait = Animal(dog);
    const swimTrait = CanSwim(dog);
  
    assert(animalTrait, 'Animal trait should be defined');
    assert.strictEqual(animalTrait?.make_sound(), 'Jack aaa!');
  
    assert(swimTrait, 'CanSwim trait should be defined');
    assert.strictEqual(swimTrait?.swim(), 'Jack is swimming!');
  });

  test('Memoization', () => {
    const dog = new Dog('Jack');
  
    const firstCall = Animal(dog);
    const secondCall = Animal(dog);
  
    assert.strictEqual(firstCall, secondCall, 'Trait instance should be memoized and consistent across calls');
  });

  test('Trait Presence Check', () => {
    assert(!Animal.has(Dog), 'Dog should not have the Animal trait');
    assert(!CanSwim.has(Dog), 'Dog should not have the CanSwim trait');
    Animal.impl(Dog);
    CanSwim.impl(Dog);
    assert(Animal.has(Dog), 'Dog should have the Animal trait');
    assert(CanSwim.has(Dog), 'Dog should have the CanSwim trait');
    assert(!Animal.has(Cat), 'Cat should not have the Animal trait until it is applied');
    assert(!CanSwim.has(Cat), 'Cat should not have the CanSwim trait');
  });
});
