import {
  Box,
  NumberInput,
  ColorInput,
  Checkbox,
  Divider,
  TextInput,
  Textarea,
} from "@mantine/core";

export default function FormRenderer({ fields, value, onChange }) {
  const renderField = (field, i) => {
    switch (field.type) {
      case "divider":
        return <Divider key={i} label={field.label} my="sm" />;

      case "checkbox":
        return (
          <Checkbox
            key={field.name}
            my={5}
            label={field.label}
            checked={value[field.name]}
            onChange={(e) =>
              onChange(field.name, e.target.checked)
            }
          />
        );

      case "number":
        return (
          <NumberInput
            key={field.name}
            label={field.label}
            value={value[field.name]}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={(val) =>
              onChange(field.name, val)
            }
          />
        );

      case "color":
        return (
          <ColorInput
            key={field.name}
            label={field.label}
            value={value[field.name]}
            onChange={(val) =>
              onChange(field.name, val)
            }
          />
        );

      case "text":
        return (
          <Textarea
            key={field.name}
            label={field.label}
            value={value[field.name]}
            onChange={(val) =>
              onChange(field.name, val)
            }
          />
        );

      default:
        return null;
    }
  };

  return <Box>{fields.map(renderField)}</Box>;
}
