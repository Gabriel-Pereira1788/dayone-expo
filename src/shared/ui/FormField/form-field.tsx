import { TextInput, View, type TextInputProps } from "react-native";
import { AppText } from "@/shared/ui/AppText";
import { MonoLabel } from "@/shared/ui/MonoLabel";
import { useFormFieldStyles } from "./form-field.styles";

export interface FormFieldProps extends Pick<TextInputProps, "keyboardType" | "multiline" | "autoCapitalize" | "secureTextEntry"> {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

/**
 * A single labelled input in the ledger design system: mono label, an
 * underline instead of a boxed field (consistent with the paper aesthetic),
 * and an error line in the shared feedback color when invalid.
 */
export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  required,
  ...inputProps
}: FormFieldProps) {
  const styles = useFormFieldStyles({ hasError: Boolean(error) });

  return (
    <View style={styles.root}>
      <MonoLabel tone="faint">{required ? `${label} *` : label}</MonoLabel>
      <TextInput
        {...inputProps}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={styles.placeholderColor}
        style={styles.input}
      />
      {error ? (
        <AppText variant="body" tone="error">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
