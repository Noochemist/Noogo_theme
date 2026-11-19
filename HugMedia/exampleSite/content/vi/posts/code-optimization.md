---
title: "Minh họa tối ưu mã và thời gian đọc"
description: "Minh họa khối mã tối ưu, tô sáng cú pháp và thời gian đọc"
date: 2026-11-16
published: 2026-11-16
tags: ["lập trình", "tối ưu", "python"]
categories: ["hướng dẫn"]
---

# Minh họa tối ưu mã và thời gian đọc

Trang này minh họa**khối mã (tô sáng cú pháp + nhãn ngôn ngữ + nút sao chép)** và**thời gian đọc / đếm từ** với phần thân dài. Nó cũng minh họa kiểu viết phổ biến "so sánh trước và sau tối ưu".

## Tình huống: tối ưu phép tính tổng

Một triển khai Python đơn giản rất trực quan, nhưng độ dễ đọc và xử lý biên có thể tốt hơn.

**Trước tối ưu (cộng dồn từng phần):**

```python
def sum_before(n):
    total = 0
    for i in range(1, n + 1):
        total += i
    return total
```

**Sau tối ưu (công thức Gauss O(1), kiểm tra tham số đầu vào):**

```python
def sum_after(n: int) -> int:
    """Trả về 1 + 2 + ... + n, O(1)."""
    if n < 0:
        raise ValueError("n must be non-negative")
    return n * (n + 1) // 2
```

Inline code như `O(1)`, tên hàm `sum_after` cũng được hiển thị bằng phông đều.

## Ghi chú

1. `sum_before` là bản đơn giản chỉ để dạy;
2. `sum_after` dùng công thức giải trực tiếp, là ví dụ quen thuộc của**tối ưu mã**;
3. Cả hai khối mã đều nên có nhãn ngôn ngữ (python) và nút sao chép trên góc phải.

## Phần thân dài (để chỗ cho thời gian đọc / đếm từ)

Có thể bạn thắc mắc vì sao trong cùng một bài lại giữ cả bản đơn giản lẫn bản tối ưu. Thực ra điều này rất phổ biến trong văn phong kỹ thuật: đưa bản "trực quan nhất" để người đọc hiểu ý nghĩa, rồi đưa bản "hiệu năng tốt nhất" để dùng trong thực tế. Trình đọc sẽ dựa vào đó đếm từ và thời gian đọc dự kiến, hiển thị ở đầu bài. Nếu thân bài đủ dài, phần tóm tắt thẻ của phong cách mạng xã hội (ví dụ Tiểu Hồng Thư, Tri Hô) cũng bị cắt đến số dòng hữu hạn dựa trên đó.

Đoạn văn này cùng tiêu đề, danh sách, bảng và hai khối mã tạo nên một trang nhiều cấp để kiểm thử thời gian đọc / đếm từ và sinh TOC. Mỗi tiêu đề cấp ba tăng thêm sẽ thêm một mục neo vào mục lục bên phải (hoặc trên), khi cuộn sẽ tô sáng vị trí tương ứng.