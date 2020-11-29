import Joi from "joi";

/// Configurable values for the bot.
export interface Config {
  templateIgnoredLabel: string;
  doesntFollowTemplateLabel: string;
  templateIgnoredCommentBody: string;
  doesntFollowTemplateCommentBody: string;
}

export const templateIgnoredLabelDefault = "template-ignored";

export const doesntFollowTemplateLabelDefault = "doesn't-follow-template";

export const templateIgnoredCommentBodyDefault =
  "Hi @{{authorLogin}}! Thank you for opening an issue! Unfortunately, it looks like you either removed the template or haven't followed or read its instructions carefully. Please [open a new issue]({{templateChooserLink}}) where you keep the template intact and read and follow its instructions carefully; it will ensure both you and team members have a far easier time discussing the issue!";

export const doesntFollowTemplateCommentBodyDefault =
  "Hi @{{authorLogin}}! Thank you for opening an issue! Please open a new issue that follows the template from [here]({{templateChooserLink}}) and a team member will get in touch with you.";

// Credit for comment body defaults goes to https://github.com/opusforlife2 (modified a bit).
export const schema = Joi.object<Config>({
  templateIgnoredLabel: Joi.string()
    .not("")
    .error(() => '"templateIgnoredLabel" must be a non-empty string')
    .description(
      "The label added to issues or PR's that ignore the template opened in the GitHub website."
    )
    .default(templateIgnoredLabelDefault),
  doesntFollowTemplateLabel: Joi.string()
    .not("")
    .error(() => '"doesntFollowTemplateLabel must be a non-empty string"')
    .description(
      "The label added to issues or PRS that don't follow the template due to being opened from a place other than the GitHub website (e.g. third-party client)."
    )
    .default(doesntFollowTemplateLabelDefault),
  templateIgnoredCommentBody: Joi.string()
    .not("")
    .error(() => '"templateIgnoredCommentBody" must be a non-empty string')
    .description(
      'The text that the bot comments when an issue is labeled with "templateIgnoredLabel".'
    )
    .default(templateIgnoredCommentBodyDefault),
  doesntFollowTemplateCommentBody: Joi.string()
    .not("")
    .error(() => '"doesntFollowTemplateCommentBody" must be a non-empty string')
    .description(
      'The text that the bot comments when an issue is labeled with "doesntFollowTemplateLabel".'
    )
    .default(doesntFollowTemplateCommentBodyDefault),
});
