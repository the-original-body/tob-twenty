import styled from '@emotion/styled';
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  IconHeadphones,
  IconPaperclip,
  IconSend,
  IconTrash,
} from 'twenty-ui/display';

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

const StyledButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  align-items: center;
  background: ${({ variant, theme }) => {
    if (variant === 'primary') return theme.color.blue;
    if (variant === 'danger') return theme.color.red;
    return 'transparent';
  }};
  border: ${({ variant, theme }) =>
    variant === 'primary' || variant === 'danger'
      ? 'none'
      : `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ variant, theme }) =>
    variant === 'primary' || variant === 'danger'
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

const StyledRecordingBar = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledRecordingIndicator = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.color.red};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledPulseDot = styled.div`
  animation: pulse 1.2s ease-in-out infinite;
  background: ${({ theme }) => theme.color.red};
  border-radius: 50%;
  height: 8px;
  width: 8px;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
`;

const StyledTimer = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-variant-numeric: tabular-nums;
  min-width: 40px;
`;

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

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
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setRecording(false);
    setDuration(0);
  }, []);

  const cancelRecording = useCallback(() => {
    chunksRef.current = [];
    stopRecording();
  }, [stopRecording]);

  const startRecording = useCallback(async () => {
    if (!onSendMedia || disabled) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/ogg; codecs=opus')
        ? 'audio/ogg; codecs=opus'
        : 'audio/webm; codecs=opus';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const ext = mimeType.includes('ogg') ? 'ogg' : 'webm';
          const file = new File([blob], `voice-message.${ext}`, {
            type: mimeType,
          });
          onSendMedia(file);
        }
        chunksRef.current = [];
      };

      recorder.start(100);
      setRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      // User denied microphone or not available
    }
  }, [onSendMedia, disabled]);

  const sendRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setRecording(false);
    setDuration(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

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

  const hasText = text.trim().length > 0;

  if (recording) {
    return (
      <StyledContainer>
        <StyledInputRow>
          <StyledButton
            variant="secondary"
            onClick={cancelRecording}
            title="Cancel recording"
          >
            <IconTrash size={18} />
          </StyledButton>
          <StyledRecordingBar>
            <StyledRecordingIndicator>
              <StyledPulseDot />
              Recording
            </StyledRecordingIndicator>
            <StyledTimer>{formatDuration(duration)}</StyledTimer>
          </StyledRecordingBar>
          <StyledButton
            variant="primary"
            onClick={sendRecording}
            title="Send voice message"
          >
            <IconSend size={18} />
          </StyledButton>
        </StyledInputRow>
      </StyledContainer>
    );
  }

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
        {hasText ? (
          <StyledButton
            variant="primary"
            onClick={handleSend}
            disabled={disabled}
          >
            <IconSend size={18} />
          </StyledButton>
        ) : (
          <StyledButton
            variant="secondary"
            onClick={startRecording}
            disabled={disabled || !onSendMedia}
            title="Record voice message"
          >
            <IconHeadphones size={18} />
          </StyledButton>
        )}
      </StyledInputRow>
    </StyledContainer>
  );
};
