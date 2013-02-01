const Lang = imports.lang;
const Applet = imports.ui.applet;
const GLib = imports.gi.GLib;
const Gettext = imports.gettext.domain('cinnamon-applets');
const _ = Gettext.gettext;

const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Util = imports.misc.util;
const Gio = imports.gi.Gio;

function MyApplet(orientation) {
    this._init(orientation);
}

MyApplet.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(orientation) {
        Applet.IconApplet.prototype._init.call(this, orientation);

        try {
        
            this.current_query = "" ;
        
            this.set_applet_icon_name("force-exit");
            this.set_applet_tooltip(_("Click here to quickly query for files."));
            
            this.menuManager = new PopupMenu.PopupMenuManager(this);
            this.menu = new Applet.AppletPopupMenu(this, orientation);
            this.menuManager.addMenu(this.menu);

            this._display() ;
            
        }
        catch (e) {
            global.logError(e);
        }
    },
     
    _display : function() {
    
            this.section = new PopupMenu.PopupMenuSection();
            this.rightPane = new St.BoxLayout({ vertical: true });
            this.searchBox = new St.BoxLayout({ style_class: 'menu-search-box' });
            this.searchEntry = new St.Entry({ name: 'menu-search-entry',
                                     hint_text: _(""),
                                     track_hover: true,
                                     can_focus: true });
            this.searchEntryText = this.searchEntry.clutter_text;
            this.selectedAppBox = new St.BoxLayout({ style_class: 'menu-selected-app-box', vertical: true });
            this.selectedAppTitle = new St.Label({ style_class: 'menu-selected-app-title', text: "" });
            this.selectedAppDescription = new St.Label({ style_class: 'menu-selected-app-description', text: "" });
            this.mainBox = new St.BoxLayout({ style_class: 'menu-applications-box', vertical:false }); 


         

        this.menu.addMenuItem(this.section);
        
        this.troubleshootItem = new PopupMenu.PopupSubMenuMenuItem(_("Results")) ;
        this.menu.addMenuItem(this.troubleshootItem) ;
        //this.troubleshootItem.setToggleState(true) ;
        //this.troubleshootItem.toggle() ;
        //this.troubleshootItem.setActive(true) ;
        
        
        this.rightPane.add_actor(this.searchBox);
        

        this.searchBox.add_actor(this.searchEntry);
        this.searchActive = false;
        
        this.searchEntryText.connect('text-changed', Lang.bind(this, this._onSearchTextChanged));


        this.selectedAppBox.add_actor(this.selectedAppTitle);

        this.selectedAppBox.add_actor(this.selectedAppDescription);
        this.rightPane.add_actor(this.selectedAppBox);
                                            
      
                
        this.mainBox.add_actor(this.rightPane, { span: 1 });
        
        this.section.actor.add_actor(this.mainBox);
        
        //this.searchEntryText.set_text(this.current_query)
    
    },
    
    _onSearchTextChanged : function () {
    
        //this.troubleshootItem.setToggleState(true) ;
        //this.troubleshootItem.toggle() ;
    
        this.troubleshootItem.menu.removeAll() ;
    
        this.current_query = this.searchEntryText.get_text() ;
    
        //this.menu.removeAll() ;
        //this._display() ;
        //this.menu.open(false) ;
        
        //global.stage.set_key_focus(this.searchEntry) ;
    
        let user_name = "anode" ;
        let nb_answer_slots = 5 ;
        
        let [res, pid, in_fd, out_fd, err_fd] = GLib.spawn_async_with_pipes(null, ['locate', '-eiq', '-n', '5', '-r', '^/home/' + user_name + '/.*/' + this.current_query + '[^/]*$'], null, GLib.SpawnFlags.SEARCH_PATH, null);

        let out_reader = new Gio.DataInputStream({
            base_stream: new Gio.UnixInputStream({fd: out_fd})
        });
        
        //expression = new RegExp("/home/" + user_name + "/[^.]{1}", "") ;
        
        let tOut = [] ;
        let tempOut = "lol" ;
        let i = 0 ;

        try{

        while (tempOut != null) {
            [tempOut, tempSize] = out_reader.read_line(null)
            if ((tempOut != null) && (i < nb_answer_slots)) {// && (expression.test(tempOut) == true)) {
                tOut[i] = tempOut ;
                //*
                let command = 'nemo ' + tempOut ;
                
                let expression = new RegExp("/[^/]+$", "") ;
                let label = expression.exec(tempOut)
                label = label[0] ;
                label = label.substring(1) ;
                
                this.troubleshootItem.menu.addAction(label, function(event) {
                    Util.spawnCommandLine(command);
                }) ;//*/
                i++ ;
            }
        }
        let fullOut = tOut.join("\n") ;

        //this.selectedAppTitle.set_text(res + " : " + pid + " : " + in_fd + " : " + out_fd + " : " + err_fd + " : " + i + " : " + tempOut + " : " + fullOut) ;
        }
        catch (e) {
            global.logError(e);
        }
        
    },

    on_applet_clicked : function(event) {
    
        this.menu.toggle() ;
        global.stage.set_key_focus(this.searchEntry) ;
        //this.troubleshootItem.setToggleState(true) ;
        this.troubleshootItem.menu.toggle() ;
        //this.troubleshootItem.setActive(true) ;
        
    }
    
};

function main(metadata, orientation) {
    let myApplet = new MyApplet(orientation);
    return myApplet;
}

