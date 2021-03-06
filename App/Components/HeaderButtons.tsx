import React from 'react'
import Icons from './Icons'
import HeaderButtons, { HeaderButton } from 'react-navigation-header-buttons'

// define IconComponent, color, sizes and OverflowIcon in one place
const TextileHeaderButton = (props: any) => {
  const color = !props.textColor ? !props.iconName ? 'blue' : 'black' : props.textColor
  const fontSize = !props.iconName ? 17 : 24
  return (
    <HeaderButton {...props} IconComponent={Icons} buttonStyle={{ fontFamily: 'BentonSans', fontSize, color }} />
  )
}

export const TextileHeaderButtons = (props: any) => {
  return (
    <HeaderButtons
      HeaderButtonComponent={TextileHeaderButton}
      OverflowIcon={<Icons name={'more'} size={32} color={'black'} />}
      {...props}
    />
  )
}

export const Item = (props: any) => {
  return (
    <HeaderButtons.Item {...props} />
  )
}
