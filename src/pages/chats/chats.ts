import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ChattingPage } from '../chatting/chatting';
import { Chat } from '../../models/chat.models';
import { User } from '../../models/user.models';
import { Constants } from '../../models/constants.models';
import { Global } from '../../providers/global';
import { Message } from '../../models/message.models';
import { TranslateService } from '@ngx-translate/core';
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-chats',
  templateUrl: 'chats.html',
  providers: [Global]
})
export class ChatsPage {
  private chats = new Array<Chat>();
  private chatsAll = new Array<Chat>();
  private userMe: User;
  private searchEnabled = false;
  private myInboxRef: firebase.database.Reference;

  constructor(private navCtrl: NavController, private global: Global, private translate: TranslateService) {
    const component = this;
    this.userMe = JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    this.myInboxRef = firebase.database().ref(Constants.REF_INBOX).child(this.userMe.id + "vc");
    this.myInboxRef.on('child_added', function (data) {
      let newMessage = data.val() as Message;
      if (newMessage && newMessage.id && newMessage.chatId) {
        let newChat = Chat.fromMessage(newMessage, (component.userMe.id + "vc") == newMessage.senderId);
        component.chatsAll.push(newChat);
        component.chatsAll.sort((one, two) => (one.dateTimeStamp > two.dateTimeStamp ? -1 : 1));
        component.chats = component.chatsAll;
        component.global.dismissToast();
      }
    });

    this.myInboxRef.on('child_changed', function (data) {
      var oldMessage = data.val() as Message;
      if (oldMessage && oldMessage.id && oldMessage.chatId) {
        let oldChat = Chat.fromMessage(oldMessage, ((component.userMe.id + "vc") == oldMessage.senderId));
        let oldIndex = -1;
        for (let i = 0; i < component.chatsAll.length; i++) {
          if (oldChat.chatId == component.chatsAll[i].chatId) {
            oldIndex = i;
            break;
          }
        }
        if (oldIndex != -1) {
          component.chatsAll.splice(oldIndex, 1);
          component.chatsAll.unshift(oldChat);
          component.chats = component.chatsAll;
        }
      }
    });

    this.translate.get("just_a_mmnt").subscribe(value => {
      this.global.showToast(value);
    });
  }

  enableSearch() {
    this.searchEnabled = !this.searchEnabled;
    if (!this.searchEnabled) {
      this.chats = this.chatsAll;
    }
  }

  getItems(searchbar: any) {
    this.filterCategories(searchbar.srcElement.value);
  }

  filterCategories(query) {
    let filtered = new Array<Chat>();
    if (query && query.length) {
      for (let cat of this.chatsAll) {
        if (cat.chatName.toLowerCase().indexOf(query.toLowerCase()) > -1) {
          filtered.push(cat);
        }
      }
      this.chats = filtered;
    } else {
      this.chats = this.chatsAll;
      this.searchEnabled = false;
    }
  }

  chatscreen(chat) {
    this.navCtrl.push(ChattingPage, { chat: chat });
  }

}