import Popover from '../popover/popover.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faEllipsisH,
  faBookmark,
  faEyeSlash,
  faThumbtack,
  faShareAlt,
  faExternalLinkAlt,
  faHistory
} from '@fortawesome/free-solid-svg-icons'
import {
  faBookmark as faBookmarkReg,
  faFlag
} from '@fortawesome/free-regular-svg-icons'

library.add(
  faEllipsisH,
  faBookmark,
  faBookmarkReg,
  faEyeSlash,
  faThumbtack,
  faShareAlt,
  faExternalLinkAlt,
  faFlag,
  faHistory
)

const ExtraButtons = {
  props: [ 'status' ],
  components: { Popover },
  methods: {
    deleteStatus () {
      const confirmed = window.confirm(this.$t('status.delete_confirm'))
      if (confirmed) {
        this.$store.dispatch('deleteStatus', { id: this.status.id })
      }
    },
    pinStatus () {
      this.$store.dispatch('pinStatus', this.status.id)
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    unpinStatus () {
      this.$store.dispatch('unpinStatus', this.status.id)
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    muteConversation () {
      this.$store.dispatch('muteConversation', this.status.id)
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    unmuteConversation () {
      this.$store.dispatch('unmuteConversation', this.status.id)
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    copyLink () {
      navigator.clipboard.writeText(this.statusLink)
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    bookmarkStatus () {
      this.$store.dispatch('bookmark', { id: this.status.id })
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    unbookmarkStatus () {
      this.$store.dispatch('unbookmark', { id: this.status.id })
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    reportStatus () {
      this.$store.dispatch('openUserReportingModal', { userId: this.status.user.id, statusIds: [this.status.id] })
    },
    editStatus () {
      this.$store.dispatch('fetchStatusSource', { id: this.status.id })
        .then(data => this.$store.dispatch('openEditStatusModal', {
          statusId: this.status.id,
          subject: data.spoiler_text,
          statusText: data.text,
          statusIsSensitive: this.status.nsfw,
          statusPoll: this.status.poll,
          statusFiles: [...this.status.attachments],
          visibility: this.status.visibility,
          statusContentType: data.content_type
        }))
    },
    showStatusHistory () {
      let originalStatus = { ...this.status }
      delete originalStatus.attachments
      delete originalStatus.created_at
      delete originalStatus.emojis
      delete originalStatus.text
      delete originalStatus.raw_html
      delete originalStatus.nsfw
      delete originalStatus.poll
      delete originalStatus.summary
      delete originalStatus.summary_raw_html
      this.$store.dispatch('openStatusHistoryModal', originalStatus)
    }
  },
  computed: {
    currentUser () { return this.$store.state.users.currentUser },
    canDelete () {
      if (!this.currentUser) { return }
      const superuser = this.currentUser.rights.moderator || this.currentUser.rights.admin
      return superuser || this.status.user.id === this.currentUser.id
    },
    ownStatus () {
      return this.status.user.id === this.currentUser.id
    },
    canPin () {
      return this.ownStatus && (this.status.visibility === 'public' || this.status.visibility === 'unlisted')
    },
    canMute () {
      return !!this.currentUser
    },
    statusLink () {
      return `${this.$store.state.instance.server}${this.$router.resolve({ name: 'conversation', params: { id: this.status.id } }).href}`
    },
    isEdited () {
      return this.status.edited_at !== null
    },
    editingAvailable () { return this.$store.state.instance.editingAvailable }
  }
}

export default ExtraButtons
