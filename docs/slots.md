# Slots

Storybook autodocs takes the following definitions:

A slot without name, is taken as the default
```
<slot>
```

Slot with name
```
<slot name="footer">
```

You can also use a slot comment as follow:
```
<!-- @slot header -->
<slot v-if="someCondition">
```
Storybook autodocs reads the `@slot` tags, and takes the next word as the slot name.

You can use the slot tag for adding extra description:
```
<!-- @slot use the header slot to provide custom layout. The slot receives two @bindings: `open` `close` -->
<slot name="header" :open="open" :close="close">
```
