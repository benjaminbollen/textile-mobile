import React from 'react'
import { View, Text } from 'react-native'
import { connect } from 'react-redux'
import { NavigationActions, SafeAreaView } from 'react-navigation'
import Toast from 'react-native-easy-toast'

import ContactSelect from '../../components/ContactSelect'
import ThreadsActions from '../../../Redux/ThreadsRedux'
import * as TextileTypes from '../../../Models/TextileTypes'
import { TextileHeaderButtons, Item } from '../../../Components/HeaderButtons'

import styles from './statics/styles'

class ThreadsEditFriends extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      selected: {}
    }
  }

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    const headerLeft = (
      <TextileHeaderButtons left>
        <Item title='Back' iconName='arrow-left' onPress={() => { navigation.dispatch(NavigationActions.back()) }} />
      </TextileHeaderButtons>
    )

    const headerRight = params.updateEnabled ? (
      <TextileHeaderButtons >
        <Item title='invite' onPress={() => {
          params.updateThread()
        }} />
      </TextileHeaderButtons>
    ) : (
      <View style={styles.headerRight}>
        <Text style={styles.headerRightText}>Invite</Text>
      </View>
    )

    return {
      headerRight,
      headerLeft
    }
  }

  componentDidMount () {
    this.props.navigation.setParams({
      updateThread: this._updateThread.bind(this),
      updateEnabled: false
    })
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.selected !== this.state.selected) {
      const updateEnabled = Object.keys(this.state.selected).find((k) => this.state.selected[k] === true)
      this.props.navigation.setParams({
        updateEnabled: !!updateEnabled
      })
    }
  }

  _getPublicLink () {
    // Generate a link dialog
    this.props.invite(
      this.props.navigation.state.params.threadId,
      this.props.navigation.state.params.threadName
    )
  }

  _select (contact, included) {
    // Toggle the id's selected state in state
    if (included) {
      return // if the user is already part of the thread
    }
    const state = !this.state.selected[contact.id]
    this.setState({
      selected: { ...this.state.selected, [contact.id]: state }
    })
  }

  _updateThread () {
    // grab the Pks from the user Ids
    const inviteePks = Object.keys(this.state.selected).filter((id) => this.state.selected[id] === true).map((id) => {
      const existing = this.props.contacts.find((ctc) => ctc.id === id)
      return existing.pk
    })

    if (inviteePks.length === 0) {
      this.refs.toast.show('Select a peer first.', 1500)
      return
    }

    this.refs.toast.show('Success! The peer list will not update until your invitees accept.', 2400)
    this.props.addInternalInvites(this.props.navigation.state.params.threadId, inviteePks)
    setTimeout(() => { this.props.navigation.dispatch(NavigationActions.back()) }, 2400)
  }

  render () {
    return (
      <SafeAreaView style={styles.container}>
        <ContactSelect
          getPublicLink={this._getPublicLink.bind(this)}
          contacts={this.props.contacts}
          select={this._select.bind(this)}
          selected={this.state.selected}
          topFive={this.props.topFive}
          notInThread={this.props.notInThread}
        />
        <Toast ref='toast' position='top' fadeInDuration={50} style={styles.toast} textStyle={styles.toastText} />
      </SafeAreaView>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const contacts = state.contacts.contacts
    .map((contact) => {
      return {
        ...contact,
        type: 'contact',
        included: contact.thread_ids.includes(ownProps.navigation.state.params.threadId)
      }
    })
    .filter(c => c.username !== '' && c.username !== undefined)

  const notInThread = contacts.filter(c => !c.included)
  const popularity = notInThread.sort((a, b) => b.thread_ids.length - a.thread_ids.length)
  const topFive = popularity.slice(0, 5)
  const sortedContacts = contacts.sort((a, b) => {
    if (a.username === null || a.username === '') {
      return 1
    } else if (b.username === null || b.username === '') {
      return -1
    }
    let A = a.username.toString().toUpperCase()
    let B = b.username.toString().toUpperCase()
    if (A === B) {
      return 0
    } else {
      return A < B ? -1 : 1
    }
  })
  return {
    topFive,
    // puts a placeholder row in contacts for adding external invite link
    contacts: sortedContacts,
    notInThread: notInThread.length
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    invite: (threadId, threadName) => { dispatch(ThreadsActions.addExternalInviteRequest(threadId, threadName)) },
    addInternalInvites: (threadId, inviteePks) => { dispatch(ThreadsActions.addInternalInvitesRequest(threadId, inviteePks)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ThreadsEditFriends)
