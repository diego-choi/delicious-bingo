class BingoService:
    """빙고 라인 감지 및 완료 체크 서비스"""

    # 12개의 빙고 라인 (가로 5, 세로 5, 대각선 2)
    WINNING_LINES = [
        # 가로 라인 (5개)
        [0, 1, 2, 3, 4],
        [5, 6, 7, 8, 9],
        [10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19],
        [20, 21, 22, 23, 24],
        # 세로 라인 (5개)
        [0, 5, 10, 15, 20],
        [1, 6, 11, 16, 21],
        [2, 7, 12, 17, 22],
        [3, 8, 13, 18, 23],
        [4, 9, 14, 19, 24],
        # 대각선 라인 (2개)
        [0, 6, 12, 18, 24],
        [4, 8, 12, 16, 20],
    ]

    @classmethod
    def get_activated_positions(cls, bingo_board):
        """리뷰가 작성된 포지션들의 집합을 반환한다"""
        reviewed_restaurant_ids = set(
            bingo_board.reviews.values_list('restaurant_id', flat=True)
        )
        template_items = bingo_board.template.items.all()
        activated = set()
        for item in template_items:
            if item.restaurant_id in reviewed_restaurant_ids:
                activated.add(item.position)
        return activated

    @classmethod
    def count_completed_lines(cls, activated_positions):
        """완성된 빙고 라인의 개수를 반환한다"""
        count = 0
        for line in cls.WINNING_LINES:
            if all(pos in activated_positions for pos in line):
                count += 1
        return count

    @classmethod
    def check_board_completion(cls, bingo_board):
        """보드가 목표 라인 수를 달성했는지 확인한다"""
        activated = cls.get_activated_positions(bingo_board)
        completed_lines = cls.count_completed_lines(activated)
        return completed_lines >= bingo_board.target_line_count
