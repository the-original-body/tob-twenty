import styled from '@emotion/styled';
import {
  type KeyboardEvent,
  useCallback,
  useRef,
  useState,
} from 'react';

import { IconPaperclip, IconSend } from 'twenty-ui/display';

const StyledContainer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
`;

const StyledInputRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTextArea = styled.textarea`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  flex: 1;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.md};
  line-height: 1.45;
  max-height: 120px;
  min-height: 38px;
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};
  resize: none;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }

  &:focus {
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  align-items: center;
  background: ${({ variant, theme }) =>
    variant === 'primary' ? theme.color.blue : 'transparent'};
  border: ${({ variant, theme }) =>
    variant === 'primary'
      ? 'none'
      : `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ variant, theme }) =>
    variant === 'primary'
      ? theme.font.color.inverted
      : theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 38px;
  justify-content: center;
  width: 38px;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

const StyledFileInput = styled.input`
  display: none;
`;

type ChatInputProps = {
  onSendText: (body: string) => void;
  onSendMedia?: (file: File) => void;
  disabled?: boolean;
};

export const ChatInput = ({
  onSendText,
  onSendMedia,
  disabled = false,
}: ChatInputProps) => {
  const [text, setText] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textAreaRef.current;

    if (!el) return;

    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();

    if (!trimmed || disabled) return;

    onSendText(trimmed);
    setText('');

    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
    }
  }, [text, disabled, onSendText]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (file && onSendMedia) {
        onSendMedia(file);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onSendMedia],
  );

  return (
    <StyledContainer>
      <StyledInputRow>
        {onSendMedia && (
          <>
            <StyledButton
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <IconPaperclip size={18} />
            </StyledButton>
            <StyledFileInput
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
            />
          </>
        )}
        <StyledTextArea
          ref={textAreaRef}
          placeholder="Type a message..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />
        <StyledButton
          variant="primary"
          onClick={handleSend}
          disabled={disabled || !text.trim()}
        >
          <IconSend size={18} />
        </StyledButton>
      </StyledInputRow>
    </StyledContainer>
  );
};
