import { type MeetingFilterValues } from '@/meeting-transcripts/types/meeting-transcripts.types';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconId, IconMail, IconSearch } from 'twenty-ui/display';

type MeetingTranscriptsFilterBarProps = {
  filterValues: MeetingFilterValues;
  onFilterChange: (values: MeetingFilterValues) => void;
};

const StyledFilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
`;

const StyledFilterInput = styled.div`
  flex: 1 1 140px;
  min-width: 120px;
`;

const StyledDateInput = styled.input`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  height: 32px;
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;

  &:focus {
    border-color: ${({ theme }) => theme.color.blue};
  }

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

export const MeetingTranscriptsFilterBar = ({
  filterValues,
  onFilterChange,
}: MeetingTranscriptsFilterBarProps) => {
  const { t } = useLingui();

  const updateFilter = (key: keyof MeetingFilterValues, value: string) => {
    onFilterChange({ ...filterValues, [key]: value });
  };

  return (
    <StyledFilterContainer>
      <StyledFilterInput>
        <TextInput
          value={filterValues.searchTerm}
          onChange={(value) => updateFilter('searchTerm', value)}
          placeholder={t`Search transcripts...`}
          LeftIcon={IconSearch}
          fullWidth
          sizeVariant="sm"
        />
      </StyledFilterInput>
      <StyledFilterInput>
        <TextInput
          value={filterValues.topic}
          onChange={(value) => updateFilter('topic', value)}
          placeholder={t`Topic`}
          fullWidth
          sizeVariant="sm"
        />
      </StyledFilterInput>
      <StyledFilterInput>
        <TextInput
          value={filterValues.host}
          onChange={(value) => updateFilter('host', value)}
          placeholder={t`Host email`}
          LeftIcon={IconMail}
          fullWidth
          sizeVariant="sm"
        />
      </StyledFilterInput>
      <StyledFilterInput>
        <TextInput
          value={filterValues.meetingId}
          onChange={(value) => updateFilter('meetingId', value)}
          placeholder={t`Meeting ID`}
          LeftIcon={IconId}
          fullWidth
          sizeVariant="sm"
        />
      </StyledFilterInput>
      <StyledFilterInput>
        <StyledDateInput
          type="date"
          value={filterValues.startDateFrom}
          onChange={(event) =>
            updateFilter('startDateFrom', event.target.value)
          }
          placeholder={t`Start date`}
          title={t`Filter by start date`}
        />
      </StyledFilterInput>
    </StyledFilterContainer>
  );
};
