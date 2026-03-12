import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconVideo } from 'twenty-ui/display';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
`;

const StyledIconContainer = styled.div`
  color: ${({ theme }) => theme.font.color.extraLight};
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledSubtitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  text-align: center;
`;

export const MeetingTranscriptsEmptyDetail = () => {
  const { t } = useLingui();

  return (
    <StyledContainer>
      <StyledIconContainer>
        <IconVideo size={48} />
      </StyledIconContainer>
      <StyledTitle>{t`Select a meeting`}</StyledTitle>
      <StyledSubtitle>
        {t`Click on a meeting from the list to view its transcript and details.`}
      </StyledSubtitle>
    </StyledContainer>
  );
};
