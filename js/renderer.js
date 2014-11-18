
//SVG text output to give to Colm

function create_node(inp, parent_set, paper){
	
	text_object = paper.text(); //Create text object
	if (inp.data('op') != 'paren') { //handle parenthesis elsewhere
		text_object.id = inp.get_id(); //Create a custom 'ID' attribute which saves the type of node and its ID
		text_object.code = inp.data('code');
		text_object.attr({'text-anchor': 'start'});
	} 
	text_object.parent = parent_set; //Create custom attribute which saves the parent node
	
	return text_object;
}

function scan_tree(input, paper) {
	
	var visit_child = function(node, idx, pset){

		if (node.n_children() == 0){
			pset.push(create_node(node, pset, paper));
		}
		else if (node.data('op') == 'paren'){
			//Left parenthesis
			var pl = create_node(node,pset,paper);
			pl.id = node.get_id();
			pl.code = '(';
			pset.push(pl);

			visit_child(node.child(0), idx, pset);

			//Right parenthesis
			var pr = create_node(node,pset,paper);
			pr.id = node.get_id()+0.1;
			pr.code = ')';
			pset.push(pr);
		}
		else{	
			node.foreach_child(function(child, cidx){
				if(cidx > 0){
					pset.push(create_node(node,pset,paper));
				}
				var cset = paper.set();
				pset.push(cset);
				visit_child(child,cidx,cset);
			})

		}
	}
	var node = input.root();
	var pset=paper.set();
	visit_child(node, 0, pset);
	return pset;
}



function display_equation(parent_set,origin)
{
	//This function parses through the set structure generated by scan_tree and then displays the text as Raphael SVG text objects. Basically, it's just a matter of assigning the right coordinates to those text elements that were already generated
	var offset = 20;
	var font_size = 30;

	// var daddy_element = parent_set[0];
	if(parent_set.constructor.prototype == Raphael.el) //If it's an element
	{
		if(parent_set.code == ')'){
			origin[0]-=offset/2;
		}
		parent_set.attr(
				{
					text: toUnicodeCharacter(parent_set.code), 
					x: (origin[0] + offset), 
					y: origin[1], 
					"font-size": font_size
				}); //Display the oprator
		var new_origin = [parent_set.getBBox().x2, origin[1]];
		if(parent_set.code == '('){
			new_origin[0]-=offset/2;
		}
		return new_origin;
	}
	else //Set it's a set
	{
		
		for(var i=0; i<parent_set.length; i++){
			origin = display_equation(parent_set[i],origin);
		}
		return origin;
			
	}
}



//Does everything to display formula
function draw_it(form, origin, gui_fl, R){
	//Defaults:
	//form - original eqaution tree
	origin = typeof origin !== 'undefined' ? origin : [30,300]; //origin coord. in Paper (or in window)
	gui_fl = typeof gui_fl !== 'undefined' ? gui_fl : false; //attach gui to object?
	if(typeof R === 'undefined'){ //raphael paper to put it in (optional)
		R = Raphael(origin[0], origin[1], 500, 50); 
		origin = [10, 10];
	}
	
	

	R.canvas.style.backgroundColor = '#FFF';

    var v = scan_tree(form, R);
    //var v1 = v;
    //confirm("press a button");
    display_equation(v, origin);
    if(gui_fl) {set_gui(v, form, R);}

    //Return set of all objects in the paper
    return v;
}