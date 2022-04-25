import React, { CSSProperties } from 'react'
// @ts-ignore
import thumb1 from './thumb1.jpg'
// @ts-ignore
import thumb2 from './thumb2.jpg'
// @ts-ignore
import thumb3 from './thumb3.jpg'
// @ts-ignore
import thumb4 from './thumb4.jpg'

const thumbs = [thumb1, thumb2, thumb3, thumb4]

export function Thumbnail({ index, style }: { index: number, style: CSSProperties }): JSX.Element {
  return <img src={thumbs[index ?? 0]} style={style} />
}
