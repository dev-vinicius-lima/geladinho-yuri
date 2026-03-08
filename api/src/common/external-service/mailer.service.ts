import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ENV_CONFIG } from 'src/config/envConfig';
@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  /**
   * Envia um e-mail para o destinatário com os dados injetados em um template Handlebars.
   * @param email O endereço de e-mail do destinatário
   * @param subject O assunto do e-mail
   * @param message A **mensagem do e-mail** (string) ou um **objeto** (chave, valor) com as variáveis a serem usadas no template do e-mail
   * @param template O template do Handlebars que será usado na construção do e-mail. Se omitdo, o template `default` será usado. Templates localizados na pasta `src\common\templates`
   */
  async send(
    email: string,
    subject: string,
    message: Record<string, any> | string,
    template?: string,
  ): Promise<unknown> {
    if (!template || template === null) {
      template = 'default';
    }

    if (typeof message === 'string') {
      message = {
        text: message,
      };
    }

    return this.mailerService.sendMail({
      to: email,
      from: ENV_CONFIG.MAIL_FROM,
      subject: subject,
      text: process.env.REQUEST_MONITORING,
      template: `${template}.hbs`,
      context: message,
    });
  }
}
