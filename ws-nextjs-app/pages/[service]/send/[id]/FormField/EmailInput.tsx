/** @jsx jsx */
import { jsx } from '@emotion/react';
import { InputProps } from '../types';
import Label from './FieldLabel';
import styles from './styles';
import InvalidMessageBox from './InvalidMessageBox';

export default ({
  id,
  name,
  handleChange,
  inputState,
  describedBy: errorBoxId,
  label,
  hasAttemptedSubmit,
}: InputProps) => {
  const {
    isValid,
    value = '',
    required,
    wasInvalid,
    messageCode,
  } = inputState ?? {};
  const useErrorTheme = hasAttemptedSubmit && !isValid;
  const labelId = `label-${id}`;

  return (
    <>
      <Label
        required={required}
        id={labelId}
        forId={id}
        useErrorTheme={useErrorTheme}
      >
        {label}
      </Label>
      <div>
        <input
          css={[styles.textField(useErrorTheme), styles.focusIndicator]}
          id={id}
          name={name}
          type="email"
          value={value as string}
          onChange={e => handleChange(e.target.name, e.target.value)}
          {...(!hasAttemptedSubmit && { 'aria-invalid': 'false' })}
          {...(hasAttemptedSubmit && {
            ...(wasInvalid && { 'aria-invalid': !isValid }),
            ...(required && !isValid && { 'aria-required': required }),
            ...(!isValid && { 'aria-describedby': errorBoxId }),
          })}
        />
      </div>
      {hasAttemptedSubmit && !isValid && (
        <InvalidMessageBox
          id={errorBoxId}
          messageCode={messageCode}
          describedBy={labelId}
        />
      )}
    </>
  );
};
