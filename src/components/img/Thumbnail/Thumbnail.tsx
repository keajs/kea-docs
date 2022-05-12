import './Thumbnail.scss'
import React, { CSSProperties } from 'react'
// @ts-ignore
import thumb0 from './thumb0.jpg'
// @ts-ignore
import thumb1 from './thumb1.jpg'
// @ts-ignore
import thumb3 from './thumb3.jpg'
// @ts-ignore
import thumb4 from './thumb4.jpg'

const thumbs = [thumb0, thumb1, thumb3, thumb4]

export interface ThumbnailProps {
  index: number
  style: CSSProperties
  comingSoon?: boolean
}

export function Thumbnail({ index, style, comingSoon }: ThumbnailProps): JSX.Element {
  return (
    <div className={`Thumbnail${comingSoon ? ' Thumbnail--coming-soon' : ''}`}>
      <img src={thumbs[index ?? 0]} style={style} />
      {comingSoon ? <div className="coming-soon">Coming soon</div> : null}
    </div>
  )
}
