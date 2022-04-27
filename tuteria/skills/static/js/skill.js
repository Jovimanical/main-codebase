var Tuteria = (function ($, _, TT, Urls) {


    _.extend(TT.Skill,{
        EditSkillForm: function(){
            var form = $('#edit_subject_form');
            TT.Skill.DescribeForm(form,function(fset,addNode){
                TT.Utils.HideFormsetControl(fset,addNode);
            });
            TT.Skill.SetPriceForm();
            TT.Skill.MediaForm(function(){
                $("#id_attachments").on('',function(){
                    $('#exhibition-pics').hide();
                })
            });            
            
            form.parsley();
        }
    });
    return TT;
}(jQuery, _, Tuteria || {}, Urls));
