import styled from '@emotion/styled';
import { type ReactNode, useState } from 'react';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

type MeetingTranscriptsCollapsibleSectionProps = {
  title: string;
  isInitiallyExpanded?: boolean;
  rightElement?: ReactNode;
  children: ReactNode;
};

const StyledSection = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const StyledHeader = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1)} 0;
  user-select: none;
`;

const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0;
`;

const StyledHeaderRight = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledRightElementWrapper = styled.div`
  display: flex;
`;

const StyledChevron = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
`;

const StyledContent = styled.div`
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

export const MeetingTranscriptsCollapsibleSection = ({
  title,
  isInitiallyExpanded = true,
  rightElement,
  children,
}: MeetingTranscriptsCollapsibleSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

  const handleToggle = () => {
    setIsExpanded((previous) => !previous);
  };

  const handleRightElementClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <StyledSection>
      <StyledHeader onClick={handleToggle}>
        <StyledTitle>{title}</StyledTitle>
        <StyledHeaderRight>
          {rightElement && (
            <StyledRightElementWrapper onClick={handleRightElementClick}>
              {rightElement}
            </StyledRightElementWrapper>
          )}
          <StyledChevron>
            {isExpanded ? (
              <IconChevronUp size={16} />
            ) : (
              <IconChevronDown size={16} />
            )}
          </StyledChevron>
        </StyledHeaderRight>
      </StyledHeader>
      <AnimatedExpandableContainer isExpanded={isExpanded}>
        <StyledContent>{children}</StyledContent>
      </AnimatedExpandableContainer>
    </StyledSection>
  );
};
