import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReviewSocialSection from './ReviewSocialSection';

// Mock useAuth
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock useReviewSocial hooks
vi.mock('../../hooks/useReviewSocial', () => ({
  useToggleLike: vi.fn(),
  useReviewComments: vi.fn(),
  useCreateComment: vi.fn(),
  useDeleteComment: vi.fn(),
}));

import { useAuth } from '../../hooks/useAuth';
import {
  useToggleLike,
  useReviewComments,
  useCreateComment,
  useDeleteComment,
} from '../../hooks/useReviewSocial';

const mockReview = {
  id: 1,
  like_count: 3,
  comment_count: 2,
  is_liked: false,
  username: 'reviewer',
  display_name: '리뷰어',
};

describe('ReviewSocialSection', () => {
  let queryClient;

  const createWrapper = () => {
    return ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();

    useAuth.mockReturnValue({ user: { username: 'testuser' } });
    useToggleLike.mockReturnValue({ mutate: vi.fn(), isPending: false });
    useReviewComments.mockReturnValue({
      data: null,
      isLoading: false,
    });
    useCreateComment.mockReturnValue({ mutate: vi.fn(), isPending: false });
    useDeleteComment.mockReturnValue({ mutate: vi.fn(), isPending: false });
  });

  const renderComponent = (review = mockReview) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ReviewSocialSection review={review} boardId="5" />
      </QueryClientProvider>
    );
  };

  it('renders like button with count', () => {
    renderComponent();
    expect(screen.getByLabelText('좋아요')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders filled heart when liked', () => {
    renderComponent({ ...mockReview, is_liked: true });
    expect(screen.getByLabelText('좋아요 취소')).toBeInTheDocument();
    expect(screen.getByText('♥')).toBeInTheDocument();
  });

  it('renders empty heart when not liked', () => {
    renderComponent();
    expect(screen.getByText('♡')).toBeInTheDocument();
  });

  it('renders comment count', () => {
    renderComponent();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls toggleLike on like button click', () => {
    const mutateFn = vi.fn();
    useToggleLike.mockReturnValue({ mutate: mutateFn, isPending: false });

    renderComponent();
    fireEvent.click(screen.getByLabelText('좋아요'));
    expect(mutateFn).toHaveBeenCalledWith(1);
  });

  it('shows comments section when comment button clicked', () => {
    useReviewComments.mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderComponent();
    fireEvent.click(screen.getByLabelText('댓글 보기'));
    expect(screen.getByText('아직 댓글이 없습니다.')).toBeInTheDocument();
  });

  it('shows comment list when expanded', () => {
    useReviewComments.mockReturnValue({
      data: [
        { id: 1, username: 'user1', display_name: '유저1', content: '좋아요!' },
        { id: 2, username: 'user2', display_name: '유저2', content: '멋져요!' },
      ],
      isLoading: false,
    });

    renderComponent();
    fireEvent.click(screen.getByLabelText('댓글 보기'));
    expect(screen.getByText('좋아요!')).toBeInTheDocument();
    expect(screen.getByText('멋져요!')).toBeInTheDocument();
  });

  it('shows delete button only for own comments', () => {
    useReviewComments.mockReturnValue({
      data: [
        { id: 1, username: 'testuser', display_name: '내이름', content: '내 댓글' },
        { id: 2, username: 'other', display_name: '다른유저', content: '다른 댓글' },
      ],
      isLoading: false,
    });

    renderComponent();
    fireEvent.click(screen.getByLabelText('댓글 보기'));

    const deleteButtons = screen.getAllByLabelText('댓글 삭제');
    expect(deleteButtons).toHaveLength(1);
  });

  it('renders comment input form', () => {
    useReviewComments.mockReturnValue({ data: [], isLoading: false });

    renderComponent();
    fireEvent.click(screen.getByLabelText('댓글 보기'));
    expect(screen.getByPlaceholderText('댓글을 입력하세요')).toBeInTheDocument();
    expect(screen.getByText('등록')).toBeInTheDocument();
  });

  it('disables like button when not authenticated', () => {
    useAuth.mockReturnValue({ user: null });
    renderComponent();
    const likeButton = screen.getByLabelText('좋아요');
    expect(likeButton).toBeDisabled();
  });
});
