package com.projectkisan.androidapp

import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Outline
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection

class BubbleNavigationBarShape(
    private val selectedItemIndex: Int,
    private val itemCount: Int
) : Shape {
    override fun createOutline(
        size: Size,
        layoutDirection: LayoutDirection,
        density: Density
    ): Outline {
        val path = Path()
        val itemWidth = size.width / itemCount
        val selectedIndexOffset = itemWidth * selectedItemIndex + itemWidth / 2f

        val bubbleRadius = 32f * density.density
        val bubbleDepth = 16f * density.density

        path.moveTo(0f, 0f)
        path.lineTo(selectedIndexOffset - bubbleRadius, 0f)

        // The bubble curve
        path.quadraticBezierTo(
            x1 = selectedIndexOffset - bubbleRadius,
            y1 = -bubbleDepth,
            x2 = selectedIndexOffset,
            y2 = -bubbleDepth
        )
        path.quadraticBezierTo(
            x1 = selectedIndexOffset + bubbleRadius,
            y1 = -bubbleDepth,
            x2 = selectedIndexOffset + bubbleRadius,
            y2 = 0f
        )

        path.lineTo(size.width, 0f)
        path.lineTo(size.width, size.height)
        path.lineTo(0f, size.height)
        path.close()

        return Outline.Generic(path)
    }
}