$(document).ready(function() {	
	$('#vocabulary-data').DataTable( {
        data: data.vocabulary,
        columns: [
			{ title: "Page" },
            { title: "English" },
            { title: "German" }
        ]
    } );
		
	init();
		
	$('#menu-create-test-select-page').selectmenu();
	
	$('#button-create-test')
		.button()
		.click( function() {
			var vocList = new VocList(data.vocabulary);
			var page = $('#menu-create-test-select-page').val();
			vocList.createTestStructure(page);
		});	
				
} );

function VocList(data) {
	this.data = data;
	this.inputClasses = "\"ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset\"";
	
	this.getEnglishGerman = function() {
		var lang;
		var rand = Math.round(Math.random());
		if(rand == 0)
			lang = 'en';
		else
			lang = 'de';
		
		return lang;
	};
	
	this.filterData = function(page) {
		var filD = $.grep(data, function( val ) {
			return val[0] == page;
		});
		return filD;
	};
	
	this.createTestStructure = function(page) {
		
		VocList.filteredShuffledData = this.filterData(page);
		VocList.filteredShuffledData.shuffle();
		
		var div = $('div#voc-test');
		
		div.empty();
		
		// create fieldset
		var htmlContent;
		htmlContent = '<fieldset class="ui-widget ui-widget-content">';
		htmlContent = htmlContent + '<legend>Vocabulary Test Page ' + page + '</legend>';
		
		// create input text-fields
		var inputTestTextFields = this.getTestFields();
		
		htmlContent = htmlContent + inputTestTextFields + '</fieldset>';
		div.append(htmlContent);
		
		// create button verify test
		this.createVerifyButton(div);
		
		var obj = this;
			
		// toggle mouseovers
		$('input#voc-mouseover')
			.click( function() {
			if( this.checked )
				obj.toggleMouseovers(true);
			else
				obj.toggleMouseovers(false);
		});
			
		div.show();
	};
	
	this.getTestFields = function() {
		
		var htmlContent = "";
		var obj = this;
		
		$.each( VocList.filteredShuffledData, function(i,v) {
			var idEn = "\"voc-" + i + "-en\"";
			var idDe = "\"voc-" + i + "-de\"";

			var enReadOnly, deReadOnly, vocValue1, vocValue2;
			
			if( obj.getEnglishGerman() == 'en' ) {
				enReadOnly = 'readonly';
				deReadOnly = '';
				vocValue1 = v[1];
				vocValue2 = '';
			} else {
				enReadOnly = '';
				deReadOnly = 'readonly';
				vocValue1 = '';
				vocValue2 = v[2];
			}
			
			var inputFieldEn = obj.getInputField(idEn, vocValue1, enReadOnly);
			var inputFieldDe = obj.getInputField(idDe, vocValue2, deReadOnly);
						
			htmlContent = htmlContent + 
						"<div class=\"voc-div\">" + 
							inputFieldEn +
							inputFieldDe + "<br>" +
						"</div>";
		});
		
		return htmlContent;
		
	};
	
	this.getInputField = function(id, vocable, read_only) {
	
		var input_field = 
					"<span class=\"voc-span\">" + 
					"<input id=" + id + " " + 
					"type=\"text\" class=" + this.inputClasses + " " + 
					"value=\"" + vocable + "\" " + 
					read_only + ">" + 
					"</span>";
						
		return input_field;	
	};
	
	this.createVerifyButton = function(div) {
	
		var obj = this;
		var verifyButton = "<input type=\"button\" id=\"btn-voc-verify\" value=\"Verify Test\"/>";
		div.append(verifyButton);
		
		// create checkbox for voc varification mouseover
		this.createVerificationMouseoverCB(div);
		
		$('#btn-voc-verify')
			.button()
			.click( function() {
								
				var readonlyInputs = $('div#voc-test').find('input[readonly]');
				
				$.each( readonlyInputs, function(index, inp) {
					var inputID = inp.id.match(/\d+/);
					var lang1 = inp.id.match(/[a-z]*$/);
					var lang2 = VocList.getOtherLang(lang1);
					var voc1 = inp.value;
					
					var voc_translation = VocList.getTranslation(voc1,lang1);
					
					// cleanup: delete all verification classes from input
					var voc_input = $('div#voc-test').find('input#voc-' + inputID + '-' + lang2);
					$.each( voc_input, function(i,v) {
						$(v).removeClass('voc-input-correct');
						$(v).removeClass('voc-input-wrong');
					});
					
					var voc_input_value = voc_input[0].value;
					
					if(VocList.verifyVocabulary(voc_translation, voc_input_value))
						voc_input.addClass('voc-input-correct');
					else
						voc_input.addClass('voc-input-wrong');
				});
				
				// add mousovers
				obj.addVerificationMouseover( $('input#voc-mouseover').is(':checked') );
			});
	
	}
	
	
	this.createVerificationMouseoverCB = function(div) {
	
		var checkbox = "<input type='checkbox' id='voc-mouseover' value='show-mouseover'>Show Erronous Vocables";
		div.append(checkbox);
	
	}
	
	this.addVerificationMouseover = function(on_) {
		
		var div = $('div#voc-test');
		
		// get all inputs without readonly property and CSS calss 'voc-input-wrong'
		
		var writableInputs = div.find('input').not('[readonly]');
		
		var vocList1 = Utils.get_subarray(VocList.filteredShuffledData, 1, 2);
		var vocList2 = Utils.get_subarray(VocList.filteredShuffledData, 2, 2);
		
		$.each( writableInputs, function(index, ip) {
		
		
			if( $(ip).hasClass('voc-input-wrong') ) {
				
				
				// get value of readonly field
				var inputID = ip.id.match(/\d+/);
				var lang1 = ip.id.match(/[a-z]*$/);
				var lang2 = VocList.getOtherLang(lang1);
				var voc_input = $('div#voc-test').find('input#voc-' + inputID + '-' + lang2)[0];
				
				var voc1 = voc_input.value;
				
				// translate readonly field
				var voc_translation = VocList.getTranslation(voc1.toString(),lang2);						
				
				$(ip).prop('title',voc_translation);
				
				$(ip)
					.tooltip({
						disabled: !on_
					});
			}
		});

	}
	
	this.toggleMouseovers = function(on_) {
		
		var div = $('div#voc-test');
		var writableInputs = div.find('input').not('[readonly]');
		
		if(on_) {
			$.each( writableInputs, function(index, ip) {
				if( $(ip).hasClass('voc-input-wrong') )
					$(ip).tooltip( "option", "disabled", false );
				if( $(ip).hasClass('voc-input-correct') )
					$(ip).tooltip( "option", "disabled", true );
				
			});
		}
		else {
			$.each( writableInputs, function(index, ip) {
				if( $(ip).hasClass('voc-input-wrong') )
					$(ip).tooltip( "option", "disabled", true );
				if( $(ip).hasClass('voc-input-correct') )
					$(ip).tooltip( "option", "disabled", true );
			});
		}
	}
	
}

// static variable
VocList.filteredShuffledData = [];
// static method
VocList.getTranslation = function(voc1, lang) {
		
	var voc2 = [];
	var vocList1 = Utils.get_subarray(VocList.filteredShuffledData, 1, 2);
	var vocList2 = Utils.get_subarray(VocList.filteredShuffledData, 2, 2);
		
	if(lang=='en')
	{
		var ind = Utils.array_matches_indizes(vocList1, voc1);
		$.each( ind, function(i,v) {
			voc2.push(vocList2[v]);
		});
	}
	if(lang=='de')
	{
		var ind = Utils.array_matches_indizes(vocList2, voc1);
		$.each( ind, function(i,v) {
			voc2.push(vocList1[v]);
		});
	}
	
	return voc2;
}

VocList.getOtherLang = function(lang) {
	if(lang=='en') return 'de';
	else return 'en';
}

VocList.verifyVocabulary = function(voc_array, voc_proof) {
	
	if ( $.inArray(voc_proof, voc_array) != -1)
		return true;
	else
		return false;
	
}

function init() {
	var pages = [];
	$.each( data.vocabulary, function(index, value) {
			pages.push(value[0]);
		}
	);
			
	$.each ( Utils.array_unique(pages), function(index, value) {
		$('#menu-create-test-select-page').append("<option>" + value + "</option>");
	});
};

class Utils {

	static array_unique(array_) {
		var unique = [];
		for ( var i = 0 ; i < array_.length ; ++i ) {
			if ( unique.indexOf(array_[i]) == -1 )
				unique.push(array_[i]);
		}
		return unique;
	};
	
	static array_matches(array_, value_) {
		
		var array_matches = [];
		var indizes = Utils.array_matches_indizes(array_, value_);
		
		$.each(indizes, function(i,v) {
			array_matches.push(array_[v]);
		});
		
		return array_matches;
	}
	
	static array_matches_indizes(array_, value_) {
		
		var index = 0;
		var indizes_matches = [];
		var i = 0;
		
		index = $.inArray( value_, array_, index);
		while (index != -1)
		{
	      indizes_matches.push(index);
		  index = $.inArray( value_, array_, index+1);			
		}
		
		return indizes_matches;
	}
	
	/**
	 * @brief get_subarray returns a onedimensional array
	 * @param array_ the array to process
	 * @param num_ the row or array to return.
	 * @param dim_ which dimension to return
	*/
	static get_subarray(array_, num_, dim_) {
	
		var out = [];
		if(dim_ > 2 || dim_ < 1)
			throw error("Dimension not supported");
		
		if(dim_ == 1) {
			out = array_[num_];
		}
		else {
			for(var i = 0; i < array_.length; i++) 
			{
				out.push(array_[i][num_]);
			}
		}
		
		return out;
	}
	
}

Array.prototype.shuffle = function() {
  var i = this.length, j, temp;
  if ( i == 0 ) return this;
  while ( --i ) {
     j = Math.floor( Math.random() * ( i + 1 ) );
     temp = this[i];
     this[i] = this[j];
     this[j] = temp;
  }
  return this;
}