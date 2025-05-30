import ImageComponent, { ImageProps } from "next/image"
import { useEffect, useState } from "react"

interface Props extends Omit<ImageProps, "alt"> {
  src: string
  width?: number
  height?: number
}
export default function RemoteImage({ src, width: inputWidth, height: inputHeight, ...props }: Props) {
  const [width, setWidth] = useState(inputWidth || 0)
  const [height, setHeight] = useState(inputHeight || 0)

  useEffect(() => {
    async function getImageSize(url: string): Promise<number[]> {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = url
        img.onload = () => resolve([img.width, img.height])
        img.onerror = reject
      })
    }

    ;(async () => {
      const [imageWidth, imageHeight]: number[] = await getImageSize(src)
      if (!width && height) {
        setWidth((imageWidth * height!) / imageHeight)
      } else if (width && !height) {
        setHeight((imageHeight * width!) / imageWidth)
      }
    })()
  }, [])

  return <ImageComponent width={width} height={height} src={src} alt="" {...props} />
}
