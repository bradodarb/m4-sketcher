import { Component, OnInit, Input } from '@angular/core';
import { ParametricManager } from '../../lib/parametrics';

@Component({
  selector: 'm4-sketcher-constraint-list',
  templateUrl: './constraint-list.component.html',
  styleUrls: ['./constraint-list.component.css']
})
export class ConstraintListComponent implements OnInit {
  @Input()
  parametricManager: ParametricManager;

  constructor() { }

  ngOnInit() {
    console.log(this.parametricManager);
  }

  private getItems() {
    var theItems = [];

    for (var j = 0; j < this.parametricManager.subSystems.length; j++) {
      var sub = this.parametricManager.subSystems[j];
      for (var i = 0; i < sub.constraints.length; ++i) {
        var constr = sub.constraints[i];
        if (constr.aux !== true/* && app.constraintFilter[constr.NAME] != true*/) {
          theItems.push({ name: constr.UI_NAME, constr: constr });
        }
      }
    }
    theItems.sort(function (a, b) {
      if (a.constr.NAME == 'coi') {
        return b.constr.NAME == 'coi' ? 0 : 1;
      }
      return a.constr.NAME.localeCompare(b.constr.NAME)
    });
    return theItems;
  }
}
/*
  var pm = app.viewer.parametricManager;
  var constrList = new ui.List('constrs', {
    items : function() {
      var theItems = [];
      for (var j = 0; j < pm.subSystems.length; j++) {
        var sub = pm.subSystems[j];
        for (var i = 0; i < sub.constraints.length; ++i) {
          var constr = sub.constraints[i];
          if (constr.aux !== true && app.constraintFilter[constr.NAME] != true) {
            theItems.push({name : constr.UI_NAME + infoStr(constr), constr : constr});
          }
        }
      }
      theItems.sort(function (a, b) {
        if (a.constr.NAME == 'coi') {
          return b.constr.NAME == 'coi' ? 0 : 1;
        }
        return a.constr.NAME.localeCompare(b.constr.NAME)
      });
      return theItems;
    },

    remove : function(item) {
      pm.remove(item.constr);
    },

    mouseleave : function(item) {
      app.viewer.deselectAll();
      app.viewer.refresh();
    },

    hover : function(item) {
      app.viewer.select(item.constr.getObjects(), true);
      app.viewer.refresh();
    },

    click : function(item) {
      var c = item.constr;
      if (c.SettableFields === undefined) return;
      for (var f in c.SettableFields) {
        var value = c[f];
        var intro = c.SettableFields[f];


        value = askNumber(intro, typeof(value) == "number" ? value.toFixed(4) : value, prompt, pm.constantResolver);
        if (value != null) {
          c[f] = value;
        }
      }
      app.viewer.parametricManager.refresh();
    }
  });

*/
