import * as _ from 'lodash'
import * as tinycolor from 'tinycolor2'

import Logs from 'Constants/logs'

/**
 * ChatterColor class used to sanitize user colors.
 * This includes readability check with the background theme color.
 */
export default class ChatterColor {
  /**
   * Checks if two colors are equals.
   * @param color1 - The first color.
   * @param color2 - The second color.
   * @return `true` when the colors are equals.
   */
  private static equals(color1: MaybeColor, color2: MaybeColor) {
    if (_.isNil(color1) || _.isNil(color2)) {
      return false
    }

    return tinycolor.equals(color1, color2)
  }

  /**
   * Converts a color to its hexadecimal string representation.
   * @param color - The color to convert.
   * @return The hexadecimal string representation.
   */
  private static toHex(color: Color) {
    return color.toHexString()
  }

  private foreground: Color
  private background: Color

  /**
   * Creates a new instance of the class.
   * @class
   * @param hexForeground - The foreground hexadecimal color.
   * @param hexBackground - The background hexadecimal color.
   */
  constructor(hexForeground: string, hexBackground: string) {
    this.foreground = tinycolor(hexForeground)
    this.background = tinycolor(hexBackground)
  }

  /**
   * Checks if the color combination is readable.
   */
  public isReadable() {
    return this.getContrast() >= Logs.ReadabilityContrast
  }

  /**
   * Find the closest readable color.
   * @return The color.
   */
  public getReadableColor() {
    const lightColor = this.findReadableColor(true)
    const darkColor = this.findReadableColor(false)

    if (_.isNil(darkColor)) {
      if (_.isNil(lightColor)) {
        return null
      }

      return ChatterColor.toHex(lightColor)
    }

    if (_.isNil(lightColor)) {
      return ChatterColor.toHex(darkColor)
    }

    const { l } = this.foreground.toHsl()
    const lightLightness = lightColor.toHsl().l
    const darkLightness = darkColor.toHsl().l

    if (lightLightness - l < l - darkLightness) {
      return ChatterColor.toHex(lightColor)
    }

    return ChatterColor.toHex(darkColor)
  }

  /**
   * Finds the lighter or darker readable color.
   * @param dark - Defines if we're searching for the darker or lighter color.
   * @return The readable color or `null` if none exists.
   */
  private findReadableColor(dark: boolean) {
    if (this.isReadable()) {
      return this.foreground
    }

    const hsl = this.foreground.toHsl()
    const h = hsl.h
    const s = hsl.s
    let l = hsl.l

    let endColor = tinycolor({ h, s, l: dark ? 0 : 100 })

    if (this.getContrast(endColor, this.background) < Logs.ReadabilityContrast) {
      return null
    }

    let minLightness = dark ? 0 : l
    let maxLightness = dark ? l : 100

    let startColor = tinycolor(hsl)

    let lastLightestColor
    let lastDarkestColor

    let color = tinycolor(hsl)

    while (!ChatterColor.equals(endColor, lastLightestColor) || !ChatterColor.equals(startColor, lastDarkestColor)) {
      lastLightestColor = endColor
      lastDarkestColor = startColor

      l = (minLightness + maxLightness) / 2
      color = tinycolor({ h, s, l })

      if (this.getContrast(color, this.background) < Logs.ReadabilityContrast) {
        startColor = tinycolor({ h, s, l })

        if (dark) {
          maxLightness = l
        } else {
          minLightness = l
        }
      } else {
        endColor = tinycolor({ h, s, l })

        if (dark) {
          minLightness = l
        } else {
          maxLightness = l
        }
      }
    }

    return endColor
  }

  /**
   * Returns the constrast between two colors..
   * The contrast is a number between 1 & 21 (1 being not readable, 21 most readable).
   * @param [color=this.foreground] - The first or foreground color.
   * @param [bgColor=this.background] - The second or background color.
   * @return The contrast.
   */
  private getContrast(color = this.foreground, bgColor = this.background) {
    return (tinycolor.readability(color, bgColor) as any) as number
  }
}

/**
 * Color alias.
 */
type Color = tinycolor.Instance

/**
 * A color, null or undefined.
 */
type MaybeColor = Color | null | undefined
