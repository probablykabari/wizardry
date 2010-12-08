/*
---
description: Paginate elements in a container

license: MIT-style

authors:
- Kabari Hendrick

requires:
  core/1.2.4:
    - Class
    - Hash
    - Event
    - Element
    - Selectors
    - Element.Style
provides:
  - Paginator
  - Element.paginate
...
*/
var Paginator = new Class({
  Implements: [Options, Events],
  version: '1.2.4',
  options:{
    linkClass: "pagination-link",
    activeLinkClass: "active-page-link",
    display: 3,
    startPosition: 0,
    onInitialize: function(){
      this.paginationButtons().inject(this.element, "after"); 
    },
    // onPageAhead: $lambda(from_page, to_page),
    // onPageBack: $lambda(from_page, to_page),
    onPageTurn: function(from_page, to_page){
      from_page.removeClass("active-page"); 
      to_page.addClass("active-page"); 
    }
  },
  initialize: function(element, options){
    this.setOptions(options);
    this.element = $(element);
    this.element.store("paginator", this);
    this.serialize();
    this.position = this.options.startPosition;
    if(this.pages.has(this.position)){
      this.fireEvent("pageTurn", [$$([]), this.pages.get(this.position)]);
    }
    this.fireEvent('initialize');
  },
  serialize: function(display){
    this.pages = new Hash();
    var slices = [];
    var num = (display || this.options.display);
    var els = this.element.getChildren("*[class!="+ this.options.linkClass +"]");
    var i = -num
    // group els into pages
    while ((i += num) < els.length)
      slices.push(els.slice(i, i+num));
    slices.each(function(group , index){
      this.set(index, $$(group));
    }, this.pages);
  },
  current: function(){
    this.pages.get(this.position);
  },
  goToPage: function(from_page_num, to_page_num){
    if (this.position == to_page_num) { return false; };
    this.position = to_page_num;
    var from_page = this.pages.get(from_page_num);
    var to_page = this.pages.get(to_page_num)
    this.fireEvent("pageTurn", [from_page, to_page]);
    this.fireEvent("page" + ((from_page_num < to_page_num) ? 'Ahead' : 'Back'), [from_page, to_page]);
  },
  turnPage: function(direction){
    var from_page = this.pages.get(this.position) || $$([]);
    if( direction == 'ahead' ) this.position++;
    else this.position--;
    this.fireEvent("pageTurn", [from_page, this.pages.get(this.position)]);
    this.fireEvent("page" + (direction || 'ahead').capitalize(), [from_page, this.current()]);

    // display or hide links based on how many pages are left
    if(!this.position) this.prev_btn.setStyle('visibility','hidden');
    else this.prev_btn.setStyle('visibility','visible');
    if(!this.pages.get(this.position+1)) this.next_btn.setStyle('visibility','hidden');
    else this.next_btn.setStyle('visibility','visible');
  },
  paginationLinks: function(){
    this.page_links = this.pages.getKeys().map(function(page, index){
      return new Element( "a", {
            "class": this.options.linkClass,
            "href": "#",
            "events": {
              "click":function(e) {
                e.preventDefault();
                var prev_page = $$(this.page_links).filter("a[class~=" + this.options.activeLinkClass +"]");
                prev_page.removeClass(this.options.activeLinkClass);
                this.goToPage((prev_page.get('html') - 1), index);
                this.page_links[index].addClass(this.options.activeLinkClass);
              }.bindWithEvent(this)
            
            }
            }).set('html', (index + 1));
    }, this);
    this.page_links[this.position].addClass(this.options.activeLinkClass);
    return new Elements($A(this.page_links).reverse());
  },
  paginationButtons: function() {
    this.next_btn = new Element( "a", {
                "class": "next_btn " + this.options.linkClass,
                "href": "#",
                "html": "next",
                "events": {
                  "click":function(e) {
                    e.preventDefault();
                    // console.log("ahead");
                    this.turnPage("ahead");
                  }.bindWithEvent(this)
                }
                });
    if (this.pages.getKeys().length == 1) this.next_btn.setStyle("visibility","hidden");
    this.prev_btn = new Element( "a", {
                "styles": {"visibility": "hidden"},
                "class": "prev_btn " + this.options.linkClass,
                "href": "#",
                "html": "previous",
                "events": {
                  "click":function(e) {
                    e.preventDefault();
                    // console.log("back");
                    this.turnPage("back");
                  }.bindWithEvent(this)
                }
                });
    return new Elements([this.next_btn, this.prev_btn]);
  },
  add: function(element, where){
    this.element.inject(element, where);
    this.serialize();
  },
  remove: function(element){
    if (this.hasChild(element)) element.dispose(); this.serialize();
  }
});

Element.implement({
    paginate: function(options){
      new Paginator(options);
      return this;
    }
});
