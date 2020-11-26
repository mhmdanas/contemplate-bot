import Joi from "joi";

/// Configurable values for the bot.
export interface Config {
  templateIgnoredLabel: string;
  doesntFollowTemplateLabel: string;
  templateIgnoredCommentBody: string;
  doesntFollowTemplateCommentBody: string;
}

// Credit for comment body defaults goes to https://github.com/opusforlife2.
export const schema = Joi.object<Config>({
  templateIgnoredLabel: Joi.string()
    .not("")
    .error(() => '"template-ignored-label" must be a non-empty string')
    .description("The label added to issues or PRS that ignore the template.")
    .default("template-ignored"),
  doesntFollowTemplateLabel: Joi.string()
    .not("")
    .error(() => '"doesntFollowTemplateLabel must be a non-empty string"')
    .description(
      "The label added to issues or PRS that don't follow the template properly."
    )
    .default("doesn't-follow-template"),
  templateIgnoredCommentBody: Joi.string()
    .not("")
    .error(() => '"templateIgnoredCommentBody" must be a non-empty string')
    .description(
      "The text that the bot comments when an issue is labeled with templateIgnoredLabel"
    )
    .default(
      "Hi @{{authorLogin}}! Thank you for opening an issue! Please edit your issue and follow the template provided [here]({{templateChooserLink}}) and a team member will get in touch with you."
    ),
  doesntFollowTemplateCommentBody: Joi.string()
    .not("")
    .error(() => '"doesntFollowTemplateCommentBody" must be a non-empty string')
    .description(
      "The text that the bot comments when an issue is labeled with doesntFollowTemplateLabel"
    )
    .default(
      `Hi @{{authorLogin}}! Thank you for opening an issue! Unfortunately, it looks like you haven't followed the template or read its instructions carefully. Please read the template again and do what it says; it will ensure both you and team members have a far easier time discussing the issue!`
    ),
});
