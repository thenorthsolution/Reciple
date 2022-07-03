[Reciple](../README.md) / [Exports](../modules.md) / MessageCommandOptions

# Class: MessageCommandOptions

## Hierarchy

- [`Array`]( https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array )<[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)\>

  ↳ **`MessageCommandOptions`**

## Table of contents

### Constructors

- [constructor](MessageCommandOptions.md#constructor)

### Properties

- [length](MessageCommandOptions.md#length)
- [[species]](MessageCommandOptions.md#[species])

### Methods

- [[iterator]](MessageCommandOptions.md#[iterator])
- [[unscopables]](MessageCommandOptions.md#[unscopables])
- [at](MessageCommandOptions.md#at)
- [concat](MessageCommandOptions.md#concat)
- [copyWithin](MessageCommandOptions.md#copywithin)
- [entries](MessageCommandOptions.md#entries)
- [every](MessageCommandOptions.md#every)
- [fill](MessageCommandOptions.md#fill)
- [filter](MessageCommandOptions.md#filter)
- [find](MessageCommandOptions.md#find)
- [findIndex](MessageCommandOptions.md#findindex)
- [flat](MessageCommandOptions.md#flat)
- [flatMap](MessageCommandOptions.md#flatmap)
- [forEach](MessageCommandOptions.md#foreach)
- [get](MessageCommandOptions.md#get)
- [getValue](MessageCommandOptions.md#getvalue)
- [includes](MessageCommandOptions.md#includes)
- [indexOf](MessageCommandOptions.md#indexof)
- [join](MessageCommandOptions.md#join)
- [keys](MessageCommandOptions.md#keys)
- [lastIndexOf](MessageCommandOptions.md#lastindexof)
- [map](MessageCommandOptions.md#map)
- [pop](MessageCommandOptions.md#pop)
- [push](MessageCommandOptions.md#push)
- [reduce](MessageCommandOptions.md#reduce)
- [reduceRight](MessageCommandOptions.md#reduceright)
- [reverse](MessageCommandOptions.md#reverse)
- [shift](MessageCommandOptions.md#shift)
- [slice](MessageCommandOptions.md#slice)
- [some](MessageCommandOptions.md#some)
- [sort](MessageCommandOptions.md#sort)
- [splice](MessageCommandOptions.md#splice)
- [toLocaleString](MessageCommandOptions.md#tolocalestring)
- [toString](MessageCommandOptions.md#tostring)
- [unshift](MessageCommandOptions.md#unshift)
- [values](MessageCommandOptions.md#values)
- [from](MessageCommandOptions.md#from)
- [isArray](MessageCommandOptions.md#isarray)
- [of](MessageCommandOptions.md#of)

## Constructors

### constructor

• **new MessageCommandOptions**(`options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[] |

#### Overrides

Array&lt;MessageCommandValidatedOption\&gt;.constructor

## Properties

### length

• **length**: `number`

Gets or sets the length of the array. This is a number one higher than the highest index in the array.

#### Inherited from

Array.length

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1279

___

### [species]

▪ `Static` `Readonly` **[species]**: `ArrayConstructor`

#### Inherited from

Array.\_\_@species@694

#### Defined in

node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:314

## Methods

### [iterator]

▸ **[iterator]**(): `IterableIterator`<[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)\>

Iterator

#### Returns

`IterableIterator`<[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)\>

#### Inherited from

Array.\_\_@iterator@185

___

### [unscopables]

▸ **[unscopables]**(): `Object`

Returns an object whose properties have the value 'true'
when they will be absent when used in a 'with' statement.

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `copyWithin` | `boolean` |
| `entries` | `boolean` |
| `fill` | `boolean` |
| `find` | `boolean` |
| `findIndex` | `boolean` |
| `keys` | `boolean` |
| `values` | `boolean` |

#### Inherited from

Array.\_\_@unscopables@202

___

### at

▸ **at**(`index`): `undefined` \| [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

Takes an integer value and returns the item at that index,
allowing for positive and negative integers.
Negative integers count back from the last item in the array.

#### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

#### Returns

`undefined` \| [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

#### Inherited from

Array.at

___

### concat

▸ **concat**(...`items`): [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]

Combines two or more arrays.
This method returns a new array without modifying any existing arrays.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...items` | `ConcatArray`<[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)\>[] | Additional arrays and/or items to add to the end of the array. |

#### Returns

[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]

#### Inherited from

Array.concat

▸ **concat**(...`items`): [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]

Combines two or more arrays.
This method returns a new array without modifying any existing arrays.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...items` | ([`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md) \| `ConcatArray`<[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)\>)[] | Additional arrays and/or items to add to the end of the array. |

#### Returns

[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]

#### Inherited from

Array.concat

___

### copyWithin

▸ **copyWithin**(`target`, `start`, `end?`): [`MessageCommandOptions`](MessageCommandOptions.md)

Returns the this object after copying a section of the array identified by start and end
to the same array starting at position target

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `number` | If target is negative, it is treated as length+target where length is the  length of the array. |
| `start` | `number` | If start is negative, it is treated as length+start. If end is negative, it  is treated as length+end. |
| `end?` | `number` | If not specified, length of the this object is used as its default value. |

#### Returns

[`MessageCommandOptions`](MessageCommandOptions.md)

#### Inherited from

Array.copyWithin

___

### entries

▸ **entries**(): `IterableIterator`<[`number`, [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)]\>

Returns an iterable of key, value pairs for every entry in the array

#### Returns

`IterableIterator`<[`number`, [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)]\>

#### Inherited from

Array.entries

___

### every

▸ **every**<`S`\>(`predicate`, `thisArg?`): this is S[]

Determines whether all the members of an array satisfy the specified test.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | extends [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `index`: `number`, `array`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]) => value is S | A function that accepts up to three arguments. The every method calls  the predicate function for each element in the array until the predicate returns a value  which is coercible to the Boolean value false, or until the end of the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function.  If thisArg is omitted, undefined is used as the this value. |

#### Returns

this is S[]

#### Inherited from

Array.every

▸ **every**(`predicate`, `thisArg?`): `boolean`

Determines whether all the members of an array satisfy the specified test.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `index`: `number`, `array`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]) => `unknown` | A function that accepts up to three arguments. The every method calls  the predicate function for each element in the array until the predicate returns a value  which is coercible to the Boolean value false, or until the end of the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function.  If thisArg is omitted, undefined is used as the this value. |

#### Returns

`boolean`

#### Inherited from

Array.every

___

### fill

▸ **fill**(`value`, `start?`, `end?`): [`MessageCommandOptions`](MessageCommandOptions.md)

Changes all array elements from `start` to `end` index to a static `value` and returns the modified array

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md) | value to fill array section with |
| `start?` | `number` | index to start filling the array at. If start is negative, it is treated as  length+start where length is the length of the array. |
| `end?` | `number` | index to stop filling the array at. If end is negative, it is treated as  length+end. |

#### Returns

[`MessageCommandOptions`](MessageCommandOptions.md)

#### Inherited from

Array.fill

___

### filter

▸ **filter**<`S`\>(`predicate`, `thisArg?`): `S`[]

Returns the elements of an array that meet the condition specified in a callback function.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | extends [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `index`: `number`, `array`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]) => value is S | A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`S`[]

#### Inherited from

Array.filter

▸ **filter**(`predicate`, `thisArg?`): [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]

Returns the elements of an array that meet the condition specified in a callback function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `index`: `number`, `array`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]) => `unknown` | A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]

#### Inherited from

Array.filter

___

### find

▸ **find**<`S`\>(`predicate`, `thisArg?`): `undefined` \| `S`

Returns the value of the first element in the array where predicate is true, and undefined
otherwise.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | extends [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`this`: `void`, `value`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `index`: `number`, `obj`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]) => value is S | find calls predicate once for each element of the array, in ascending  order, until it finds one where predicate returns true. If such an element is found, find  immediately returns that element value. Otherwise, find returns undefined. |
| `thisArg?` | `any` | If provided, it will be used as the this value for each invocation of  predicate. If it is not provided, undefined is used instead. |

#### Returns

`undefined` \| `S`

#### Inherited from

Array.find

▸ **find**(`predicate`, `thisArg?`): `undefined` \| [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | (`value`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `index`: `number`, `obj`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]) => `unknown` |
| `thisArg?` | `any` |

#### Returns

`undefined` \| [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

#### Inherited from

Array.find

___

### findIndex

▸ **findIndex**(`predicate`, `thisArg?`): `number`

Returns the index of the first element in the array where predicate is true, and -1
otherwise.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `index`: `number`, `obj`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]) => `unknown` | find calls predicate once for each element of the array, in ascending  order, until it finds one where predicate returns true. If such an element is found,  findIndex immediately returns that element index. Otherwise, findIndex returns -1. |
| `thisArg?` | `any` | If provided, it will be used as the this value for each invocation of  predicate. If it is not provided, undefined is used instead. |

#### Returns

`number`

#### Inherited from

Array.findIndex

___

### flat

▸ **flat**<`A`, `D`\>(`this`, `depth?`): `FlatArray`<`A`, `D`\>[]

Returns a new array with all sub-array elements concatenated into it recursively up to the
specified depth.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `A` | `A` |
| `D` | extends `number` = ``1`` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `this` | `A` | - |
| `depth?` | `D` | The maximum recursion depth |

#### Returns

`FlatArray`<`A`, `D`\>[]

#### Inherited from

Array.flat

___

### flatMap

▸ **flatMap**<`U`, `This`\>(`callback`, `thisArg?`): `U`[]

Calls a defined callback function on each element of an array. Then, flattens the result into
a new array.
This is identical to a map followed by flat with depth 1.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | `U` |
| `This` | `undefined` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback` | (`this`: `This`, `value`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `index`: `number`, `array`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]) => `U` \| readonly `U`[] | A function that accepts up to three arguments. The flatMap method calls the  callback function one time for each element in the array. |
| `thisArg?` | `This` | An object to which the this keyword can refer in the callback function. If  thisArg is omitted, undefined is used as the this value. |

#### Returns

`U`[]

#### Inherited from

Array.flatMap

___

### forEach

▸ **forEach**(`callbackfn`, `thisArg?`): `void`

Performs the specified action for each element in an array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`value`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `index`: `number`, `array`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]) => `void` | A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`void`

#### Inherited from

Array.forEach

___

### get

▸ **get**(`name`, `requied`): [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

Get the option info

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `requied` | ``true`` |

#### Returns

[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

▸ **get**(`name`, `requied?`): ``null`` \| [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `requied?` | `boolean` |

#### Returns

``null`` \| [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

___

### getValue

▸ **getValue**(`name`, `requied`): `string`

Get the option value

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `requied` | ``true`` |

#### Returns

`string`

▸ **getValue**(`name`, `requied?`): ``null`` \| `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `requied?` | `boolean` |

#### Returns

``null`` \| `string`

___

### includes

▸ **includes**(`searchElement`, `fromIndex?`): `boolean`

Determines whether an array includes a certain element, returning true or false as appropriate.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `searchElement` | [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md) | The element to search for. |
| `fromIndex?` | `number` | The position in this array at which to begin searching for searchElement. |

#### Returns

`boolean`

#### Inherited from

Array.includes

___

### indexOf

▸ **indexOf**(`searchElement`, `fromIndex?`): `number`

Returns the index of the first occurrence of a value in an array, or -1 if it is not present.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `searchElement` | [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md) | The value to locate in the array. |
| `fromIndex?` | `number` | The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0. |

#### Returns

`number`

#### Inherited from

Array.indexOf

___

### join

▸ **join**(`separator?`): `string`

Adds all the elements of an array into a string, separated by the specified separator string.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `separator?` | `string` | A string used to separate one element of the array from the next in the resulting string. If omitted, the array elements are separated with a comma. |

#### Returns

`string`

#### Inherited from

Array.join

___

### keys

▸ **keys**(): `IterableIterator`<`number`\>

Returns an iterable of keys in the array

#### Returns

`IterableIterator`<`number`\>

#### Inherited from

Array.keys

___

### lastIndexOf

▸ **lastIndexOf**(`searchElement`, `fromIndex?`): `number`

Returns the index of the last occurrence of a specified value in an array, or -1 if it is not present.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `searchElement` | [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md) | The value to locate in the array. |
| `fromIndex?` | `number` | The array index at which to begin searching backward. If fromIndex is omitted, the search starts at the last index in the array. |

#### Returns

`number`

#### Inherited from

Array.lastIndexOf

___

### map

▸ **map**<`U`\>(`callbackfn`, `thisArg?`): `U`[]

Calls a defined callback function on each element of an array, and returns an array that contains the results.

#### Type parameters

| Name |
| :------ |
| `U` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`value`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `index`: `number`, `array`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]) => `U` | A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value. |

#### Returns

`U`[]

#### Inherited from

Array.map

___

### pop

▸ **pop**(): `undefined` \| [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

Removes the last element from an array and returns it.
If the array is empty, undefined is returned and the array is not modified.

#### Returns

`undefined` \| [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

#### Inherited from

Array.pop

___

### push

▸ **push**(...`items`): `number`

Appends new elements to the end of an array, and returns the new length of the array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...items` | [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[] | New elements to add to the array. |

#### Returns

`number`

#### Inherited from

Array.push

___

### reduce

▸ **reduce**(`callbackfn`): [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`previousValue`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `currentValue`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `currentIndex`: `number`, `array`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]) => [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md) | A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array. |

#### Returns

[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

#### Inherited from

Array.reduce

▸ **reduce**(`callbackfn`, `initialValue`): [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `callbackfn` | (`previousValue`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `currentValue`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `currentIndex`: `number`, `array`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]) => [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md) |
| `initialValue` | [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md) |

#### Returns

[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

#### Inherited from

Array.reduce

▸ **reduce**<`U`\>(`callbackfn`, `initialValue`): `U`

Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

#### Type parameters

| Name |
| :------ |
| `U` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`previousValue`: `U`, `currentValue`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `currentIndex`: `number`, `array`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]) => `U` | A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array. |
| `initialValue` | `U` | If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value. |

#### Returns

`U`

#### Inherited from

Array.reduce

___

### reduceRight

▸ **reduceRight**(`callbackfn`): [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`previousValue`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `currentValue`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `currentIndex`: `number`, `array`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]) => [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md) | A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array. |

#### Returns

[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

#### Inherited from

Array.reduceRight

▸ **reduceRight**(`callbackfn`, `initialValue`): [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `callbackfn` | (`previousValue`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `currentValue`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `currentIndex`: `number`, `array`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]) => [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md) |
| `initialValue` | [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md) |

#### Returns

[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

#### Inherited from

Array.reduceRight

▸ **reduceRight**<`U`\>(`callbackfn`, `initialValue`): `U`

Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.

#### Type parameters

| Name |
| :------ |
| `U` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callbackfn` | (`previousValue`: `U`, `currentValue`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `currentIndex`: `number`, `array`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]) => `U` | A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array. |
| `initialValue` | `U` | If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value. |

#### Returns

`U`

#### Inherited from

Array.reduceRight

___

### reverse

▸ **reverse**(): [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]

Reverses the elements in an array in place.
This method mutates the array and returns a reference to the same array.

#### Returns

[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]

#### Inherited from

Array.reverse

___

### shift

▸ **shift**(): `undefined` \| [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

Removes the first element from an array and returns it.
If the array is empty, undefined is returned and the array is not modified.

#### Returns

`undefined` \| [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)

#### Inherited from

Array.shift

___

### slice

▸ **slice**(`start?`, `end?`): [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]

Returns a copy of a section of an array.
For both start and end, a negative index can be used to indicate an offset from the end of the array.
For example, -2 refers to the second to last element of the array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start?` | `number` | The beginning index of the specified portion of the array.  If start is undefined, then the slice begins at index 0. |
| `end?` | `number` | The end index of the specified portion of the array. This is exclusive of the element at the index 'end'.  If end is undefined, then the slice extends to the end of the array. |

#### Returns

[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]

#### Inherited from

Array.slice

___

### some

▸ **some**(`predicate`, `thisArg?`): `boolean`

Determines whether the specified callback function returns true for any element of an array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `predicate` | (`value`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `index`: `number`, `array`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]) => `unknown` | A function that accepts up to three arguments. The some method calls  the predicate function for each element in the array until the predicate returns a value  which is coercible to the Boolean value true, or until the end of the array. |
| `thisArg?` | `any` | An object to which the this keyword can refer in the predicate function.  If thisArg is omitted, undefined is used as the this value. |

#### Returns

`boolean`

#### Inherited from

Array.some

___

### sort

▸ **sort**(`compareFn?`): [`MessageCommandOptions`](MessageCommandOptions.md)

Sorts an array in place.
This method mutates the array and returns a reference to the same array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `compareFn?` | (`a`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md), `b`: [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)) => `number` | Function used to determine the order of the elements. It is expected to return  a negative value if the first argument is less than the second argument, zero if they're equal, and a positive  value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.  ```ts  [11,2,22,1].sort((a, b) => a - b)  ``` |

#### Returns

[`MessageCommandOptions`](MessageCommandOptions.md)

#### Inherited from

Array.sort

___

### splice

▸ **splice**(`start`, `deleteCount?`): [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]

Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start` | `number` | The zero-based location in the array from which to start removing elements. |
| `deleteCount?` | `number` | The number of elements to remove. |

#### Returns

[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]

An array containing the elements that were deleted.

#### Inherited from

Array.splice

▸ **splice**(`start`, `deleteCount`, ...`items`): [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]

Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start` | `number` | The zero-based location in the array from which to start removing elements. |
| `deleteCount` | `number` | The number of elements to remove. |
| `...items` | [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[] | Elements to insert into the array in place of the deleted elements. |

#### Returns

[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[]

An array containing the elements that were deleted.

#### Inherited from

Array.splice

___

### toLocaleString

▸ **toLocaleString**(): `string`

Returns a string representation of an array. The elements are converted to string using their toLocaleString methods.

#### Returns

`string`

#### Inherited from

Array.toLocaleString

___

### toString

▸ **toString**(): `string`

Returns a string representation of an array.

#### Returns

`string`

#### Inherited from

Array.toString

___

### unshift

▸ **unshift**(...`items`): `number`

Inserts new elements at the start of an array, and returns the new length of the array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...items` | [`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)[] | Elements to insert at the start of the array. |

#### Returns

`number`

#### Inherited from

Array.unshift

___

### values

▸ **values**(): `IterableIterator`<[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)\>

Returns an iterable of values in the array

#### Returns

`IterableIterator`<[`MessageCommandValidatedOption`](../interfaces/MessageCommandValidatedOption.md)\>

#### Inherited from

Array.values

___

### from

▸ `Static` **from**<`T`\>(`arrayLike`): `T`[]

Creates an array from an array-like object.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `arrayLike` | `ArrayLike`<`T`\> | An array-like object to convert to an array. |

#### Returns

`T`[]

#### Inherited from

Array.from

▸ `Static` **from**<`T`, `U`\>(`arrayLike`, `mapfn`, `thisArg?`): `U`[]

Creates an array from an iterable object.

#### Type parameters

| Name |
| :------ |
| `T` |
| `U` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `arrayLike` | `ArrayLike`<`T`\> | An array-like object to convert to an array. |
| `mapfn` | (`v`: `T`, `k`: `number`) => `U` | A mapping function to call on every element of the array. |
| `thisArg?` | `any` | Value of 'this' used to invoke the mapfn. |

#### Returns

`U`[]

#### Inherited from

Array.from

▸ `Static` **from**<`T`\>(`iterable`): `T`[]

Creates an array from an iterable object.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `iterable` | `Iterable`<`T`\> \| `ArrayLike`<`T`\> | An iterable object to convert to an array. |

#### Returns

`T`[]

#### Inherited from

Array.from

▸ `Static` **from**<`T`, `U`\>(`iterable`, `mapfn`, `thisArg?`): `U`[]

Creates an array from an iterable object.

#### Type parameters

| Name |
| :------ |
| `T` |
| `U` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `iterable` | `Iterable`<`T`\> \| `ArrayLike`<`T`\> | An iterable object to convert to an array. |
| `mapfn` | (`v`: `T`, `k`: `number`) => `U` | A mapping function to call on every element of the array. |
| `thisArg?` | `any` | Value of 'this' used to invoke the mapfn. |

#### Returns

`U`[]

#### Inherited from

Array.from

___

### isArray

▸ `Static` **isArray**(`arg`): arg is any[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | `any` |

#### Returns

arg is any[]

#### Inherited from

Array.isArray

___

### of

▸ `Static` **of**<`T`\>(...`items`): `T`[]

Returns a new array from a set of elements.

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...items` | `T`[] | A set of elements to include in the new array object. |

#### Returns

`T`[]

#### Inherited from

Array.of
