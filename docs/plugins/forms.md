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

Here, in our example `featureFlagLogic`, we take an existing reducer called `featureFlag` (exposed through a [loader](/docs/plugins/loaders)),
and convert it into a form.

```ts
import { kea } from 'kea'
import { loaders } from 'kea-loaders'
import { forms } from 'kea-forms'

export const featureFlagLogic = kea<featureFlagLogicType<FeatureFlagLogicProps>>([
  path(['scenes', 'feature-flags', 'featureFlagLogic']),
  props({} as FeatureFlagLogicProps),
  key(({ id }) => id ?? 'new'),

  loaders(({ props }) => ({
    featureFlag: [
      { ...NEW_FLAG } as FeatureFlagModel,
      {
        loadFeatureFlag: () => api.get(`api/feature_flags/${props.id}`),
      },
    ],
  })),

  forms(({ actions }) => ({
    featureFlag: {
      // not really needed again since loader already defines it
      defaults: { ...NEW_FLAG } as FeatureFlagModel,

      // sync validation, will be shown as errors in the form
      errors: (featureFlag) => ({
        key: !featureFlag.key ? 'Must have a key' : undefined,
      }),

      // called on the form's onSubmit, unless a validation fails
      submit: async (featureFlag, breakpoint) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { created_at, id, ...flag } = featureFlag
        const newFeatureFlag = updatedFlag.id
          ? await api.update(
              `api/projects/${values.currentTeamId}/feature_flags/${updatedFlag.id}`,
              flag
            )
          : await api.create(`api/projects/${values.currentTeamId}/feature_flags`, flag)
        breakpoint()
        actions.setFeatureFlagValues(newFeatureFlag)
        lemonToast.success('Feature flag saved')
        featureFlagsLogic.findMounted()?.actions.updateFlag(featureFlag)
        router.actions.replace(urls.featureFlag(featureFlag.id))
      },
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

export function FeatureFlag({ id }: { id?: string } = {}): JSX.Element {
  const logicProps: FeatureFlagLogicProps = { id: id ? parseInt(id) : 'new' }
  const {
    featureFlag, // the values in the object are the values in the form
    isFeatureFlagSubmitting, // if the submit action is doing something
  } = useValues(featureFlagLogic(logicProps))
  const {
    submitFeatureFlag, // if we need to submit it outside the normal form submit
    setFeatureFlagValue, // if we need to update any field outside the <Field /> tags
  } = useActions(featureFlagLogic(logicProps))

  return (
    <Form logic={featureFlagLogic} props={logicProps} formKey="featureFlag">
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
