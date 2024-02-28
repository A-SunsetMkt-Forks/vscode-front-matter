import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Downshift from 'downshift';
import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { BaseFieldProps } from '../../../models';
import { Choice } from '../../../models/Choice';
import { ChoiceButton } from './ChoiceButton';
import { FieldTitle } from './FieldTitle';
import { FieldMessage } from './FieldMessage';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import useDropdownStyle from '../../hooks/useDropdownStyle';

export interface IChoiceFieldProps extends BaseFieldProps<string | string[]> {
  choices: string[] | Choice[];
  multiSelect?: boolean;
  onChange: (value: string | string[]) => void;
}

export const ChoiceField: React.FunctionComponent<IChoiceFieldProps> = ({
  label,
  description,
  value,
  choices,
  multiSelect,
  onChange,
  required
}: React.PropsWithChildren<IChoiceFieldProps>) => {
  const [crntSelected, setCrntSelected] = React.useState<string | string[] | null>(value);
  const dsRef = React.useRef<Downshift<string> | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const { getDropdownStyle } = useDropdownStyle(inputRef as any);

  const onValueChange = (txtValue: string) => {
    if (multiSelect) {
      const newValue = [...((crntSelected || []) as string[]), txtValue];
      setCrntSelected(newValue);
      onChange(newValue);
    } else {
      setCrntSelected(txtValue);
      onChange(txtValue);
    }
  };

  const removeSelected = (txtValue: string) => {
    if (multiSelect) {
      const newValue = [...(crntSelected || [])].filter((v) => v !== txtValue);
      setCrntSelected(newValue);
      onChange(newValue);
    } else {
      setCrntSelected('');
      onChange('');
    }
  };

  const getValue = (value: string | Choice, type: 'id' | 'title') => {
    if (typeof value === 'string' || typeof value === 'number') {
      return `${value}`;
    }
    return `${value[type]}`;
  };

  const getChoiceValue = (value: string) => {
    const choice = (choices as Array<string | Choice>).find(
      (c: string | Choice) => getValue(c, 'id') === value
    );
    if (choice) {
      return getValue(choice, 'title');
    }
    return '';
  };

  const availableChoices = !multiSelect
    ? choices
    : (choices as Array<string | Choice>).filter((choice: string | Choice) => {
      const value = typeof choice === 'string' || typeof choice === 'number' ? choice : choice.id;

      if (typeof crntSelected === 'string') {
        return crntSelected !== `${value}`;
      } else if (crntSelected instanceof Array) {
        return crntSelected.indexOf(`${value}`) === -1;
      }

      return true;
    });

  const showRequiredState = useMemo(() => {
    return (
      required && ((crntSelected instanceof Array && crntSelected.length === 0) || !crntSelected)
    );
  }, [required, crntSelected]);

  useEffect(() => {
    if (crntSelected !== value) {
      setCrntSelected(value);
    }
  }, [value]);

  return (
    <div className={`metadata_field ${showRequiredState ? 'required' : ''}`}>
      <FieldTitle label={label} icon={<CheckIcon />} required={required} />

      <Downshift
        ref={dsRef}
        onSelect={(selected) => onValueChange(selected || '')}
        itemToString={(item) => (item ? item : '')}
      >
        {({ getToggleButtonProps, getItemProps, getMenuProps, isOpen, getRootProps }) => (
          <div
            {...getRootProps(undefined, { suppressRefError: true })}
            ref={inputRef}
            className={`metadata_field__choice`}
          >
            <button
              {...getToggleButtonProps({
                className: `metadata_field__choice__toggle`,
                disabled: availableChoices.length === 0
              })}
            >
              <span>{l10n.t(LocalizationKey.panelFieldsChoiceFieldSelect, label)}</span>
              <ChevronDownIcon className="icon" />
            </button>

            <ul
              className={`field_dropdown metadata_field__choice_list ${isOpen ? 'open' : 'closed'}`}
              style={{
                bottom: getDropdownStyle(isOpen)
              }}
              {...getMenuProps()}
            >
              {
                availableChoices.map((choice, index) => (
                  <li
                    {...getItemProps({
                      key: getValue(choice, 'id'),
                      index,
                      item: getValue(choice, 'id')
                    })}
                  >
                    {getValue(choice, 'title') || (
                      <span className={`metadata_field__choice_list__item`}>
                        {l10n.t(LocalizationKey.commonClearValue)}
                      </span>
                    )}
                  </li>
                ))
              }
            </ul>
          </div>
        )}
      </Downshift>

      <FieldMessage
        name={label.toLowerCase()}
        description={description}
        showRequired={showRequiredState}
      />

      {crntSelected instanceof Array
        ? crntSelected.map((value: string) => (
          <ChoiceButton
            key={value}
            value={value}
            title={getChoiceValue(value)}
            onClick={removeSelected}
          />
        ))
        : crntSelected && (
          <ChoiceButton
            key={crntSelected}
            value={crntSelected}
            title={getChoiceValue(crntSelected)}
            onClick={removeSelected}
          />
        )}
    </div>
  );
};
