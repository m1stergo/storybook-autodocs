# Emits

Storybook autodocs will infer defineEmits statements defined as:

```typescript
const emit = defineEmits<{
  (e: 'click'): void;
}>();
```
or
```typescript
type Emits = {
  (e: 'click'): void;
}
const emit = defineEmits<Emits>();
```

## Params
Storybook autodocs inferes the params from defineEmits statement.
Params can be of any supported type as described in the Props section.

```typescript
const emit = defineEmits<{
  (e: "click", index: number): void;
  (e: "selected", payload: {a: true, b: true}): void;
}>();
```
![emits](./emits.png){width=350px}
