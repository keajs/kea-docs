# forms

The [kea-forms](https://github.com/keajs/kea-forms) package provides tools for working with form-like data.

## Installation

```shell
# if you're using yarn
yarn add kea-forms

# if you're using npm
npm install --save kea-forms
```

## `forms()` logic builder

Use the `forms` logic builder to either create a new reducer, or augment an existing reducer with actions and
selectors to manipulate form-like data.

In this example `featureFlagLogic`, we take an existing reducer called `featureFlag` (exposed through a [loader](/docs/plugins/loaders)),
and convert it into a form.

```ts
import { kea } from 'kea'
import { loaders } from 'kea-loaders'
import { forms } from 'kea-forms'
import { router } from 'kea-router'

export const featureFlagLogic = kea<featureFlagLogicType>([
  path(['scenes', 'feature-flags', 'featureFlagLogic']),
  props({} as FeatureFlagLogicProps),
  key(({ id }) => id ?? 'new'),

  afterMount(({ actions }) => actions.init()),
  loaders(({ props }) => ({
    featureFlag: { init: () => api.get(`api/feature_flags/${props.id}`) },
  })),

  forms(({ actions }) => ({
    featureFlag: {
      // not needed again if a loader or reducer already defines it
      defaults: { id: undefined, key: '' } as FeatureFlagModel,

      // sync validation, will be shown as errors in the form
      errors: ({ key }) => ({
        key: !key ? 'Must have a key' : undefined,
      }),

      // called on the form's onSubmit, unless `errors` contains values
      submit: async ({ id, ...flag }, breakpoint) => {
        const updatedFlag = id
          ? await api.update(`api/feature_flags/${id}`, flag)
          : await api.create(`api/feature_flags`, flag)
        // avoid double-clicks
        breakpoint()

        // this action `resetFeatureFlag` is added by the `forms()` builder
        actions.resetFeatureFlag(updatedFlag)

        // housekeeping
        console.log('Feature flag saved')
        router.actions.replace(urls.featureFlag(updatedFlag.id))
      },
        
      // whether we show errors after touch (true) or submit (false)
      showErrorsOnTouch: true,
      
      // show errors even without submitting first
      alwaysShowErrors: false,
    },
  })),
])
```

This adds [a bunch of actions, reducers and selectors](https://github.com/keajs/kea-forms/blob/a5efcba7c850408f73c0f015f28e8e8d5a7b6651/src/builder.ts#L26)
onto `featureFlagLogic`. This is the list as of kea-forms `v3.0.0-alpha.0`:

```tsx
export interface featureFlagLogicType extends Logic {
  actions: {
    // kea-loaders
    loadFeatureFlag: () => void
    loadFeatureFlagSuccess: (featureFlag: any, payload?: any) => void
    loadFeatureFlagFailure: (error: string, errorObject?: any) => void

    // kea-forms
    setFeatureFlagValue: (key: FieldName, value: any) => void
    setFeatureFlagValues: (values: DeepPartial<FeatureFlagType>) => void
    touchFeatureFlagField: (key: string) => void
    resetFeatureFlag: (values?: FeatureFlagType) => void
    submitFeatureFlag: () => void
    submitFeatureFlagRequest: (featureFlag: FeatureFlagType) => void
    submitFeatureFlagSuccess: (featureFlag: FeatureFlagType) => void
    submitFeatureFlagFailure: (error: Error) => void
  }
  values: {
    // kea-loaders
    featureFlag: FeatureFlagType
    featureFlagLoading: boolean

    // kea-forms
    isFeatureFlagSubmitting: boolean
    showFeatureFlagErrors: boolean
    featureFlagChanged: boolean
    featureFlagTouches: Record<string, boolean>
  }
}
```

## React components

With the logic in order, you may use the `<Form />`, `<Field />` and `<Group />` helpers to build your form.

```tsx
import { Switch, Textarea, Input, Button } from '../ui' // stub
import { Form, Field, Group } from 'kea-forms'
import { featureFlagLogic, FeatureFlagLogicProps } from './featureFlagLogic'

export function FeatureFlag({ id }: { id?: number }): JSX.Element {
  const logicProps: FeatureFlagLogicProps = { id: id ?? 'new' }
  const {
    featureFlag, // the values in the object are the values in the form
    isFeatureFlagSubmitting, // if the `submit` action is doing something
  } = useValues(featureFlagLogic(logicProps))
  const {
    submitFeatureFlag, // if we need to submit it outside the normal form submit
    setFeatureFlagValue, // if we need to update any field outside the <Field /> tags
  } = useActions(featureFlagLogic(logicProps))

  return (
    <Form logic={featureFlagLogic} props={logicProps} formKey="featureFlag" enableFormOnSubmit>
      <Field name="active">
        {/* value, onChange, onValueChange, name, label, id */}
        {({ value, onValueChange }) => (
          <Switch
            checked={value}
            onChange={onValueChange}
            label={
              value ? (
                <span className="text-success">Enabled</span>
              ) : (
                <span className="text-danger">Disabled</span>
              )
            }
          />
        )}
      </Field>

      <Field name="name" label="Description">
        {({ value, onChange }) => (
          <TextArea
            value={value}
            onChange={onChange}
            className="ph-ignore-input"
            data-attr="feature-flag-description"
            placeholder="Adding a helpful description can ensure others know what this feature is for."
          />
        )}
      </Field>

      {featureFlag?.filters?.multivariate?.variants?.map((_, index) => (
        // using <Group /> to scope the next fields
        <Group key={index} name={['filters', 'multivariate', 'variants', index]}>
          <Field name="name">
            {/* This will update featureFlag.filters.multivariate.variants[index].name */}
            {/* If you don't specify ({ value, onChange }) => (), we add these two props automatically */}
            <Input placeholder="Description" />
          </Field>
        </Group>
      ))}

      <Button
        loading={isFeatureFlagSubmitting}
        icon={<SaveOutlined />}
        htmlType="submit"
        type="primary"
      >
        Save changes
      </Button>
    </Form>
  )
}
```

## Templates

To provide your own `Field` templates, use the `template` tag together with `noStyle`. For example:

```tsx
import { FieldProps as KeaFieldProps, Field as KeaField } from 'kea-forms'

interface FieldProps extends KeaFieldProps {
  label: JSX.Element | string
}

export function Field({ children, name, label, ...props }: FieldProps): ReturnType<typeof KeaField> {
  const template: KeaFieldProps['template'] = ({ label, kids, error }) => {
    return (
      <div>
        {label ? <label>{label}</label> : null}
        {kids as any}
        {error ? <div className="error">{error}</div> : null}
      </div>
    )
  }
  return <KeaField {...props} children={children} name={name} label={label} template={template} noStyle />
}
```

## Re-rendering

The `useValues` hooks [re-render their components](/docs/react/useValues#re-rendering) if their values change, and then only downwards. Forms are no exception.

If you fetch your form's values (e.g. `featureFlag`) at a root component (e.g. the one that contains all the fields), all the fields will re-render
every time any value changes. 

You should avoid this, and rely on `<Field>`, which re-render only when individual values change. 
