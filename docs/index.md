# What is Storybook autodocs

`storybook-autodocs` is an utility that takes the typescript definitions in your Vue components and creates the argTypes for storybook automatically.

## Why
Storybook uses the `vue-docgen-api` to infer `storybook argTypes` from your components. In many cases it is not able to infer basic definitions such as a Union `"success|warning|info|error"`.

You must add extra effort to manually define and update stories, which is time consuming and most developers are not willing to do, so the stories end up being rather vague and not adding much value.

_without storybook-autodocs_
![before](./before.png)

_with storybook-autodocs_
![after](./after.png)

## Solution
- `storybook-autodocs` does not require any additional information other than the type definition already implemented in the Vue file.

- `storybook-autodocs` analyzes the typescript definitions of the Vue file and generates the storybook argTypes from it.


## Limitations
- At the moment, this utility only works with Vue 3 Single File Componets using &lt;script Setup&gt;.
- The functionality infers the most common types, such as Union, Booleans, Objects, Arrays, some complex types might not be inferred.
