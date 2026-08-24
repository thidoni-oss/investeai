// InvesteAI Backend - VERSÃO DADOS REAIS TDONIZETTI
// Deploy em Railway
// Todos os dados de TDONIZETTI já estão preenchidos ✅

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================
// SUPABASE SETUP
// ============================================================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================
// ✅ DADOS REAIS TDONIZETTI (JÁ PREENCHIDOS)
// ============================================================

const TDONIZETTI_CONFIG = {
  whatsapp: process.env.TDONIZETTI_WHATSAPP || '+5511937491873',
  email: process.env.TDONIZETTI_EMAIL || 'thiago@tdonizetti.com',
  instagram: 'https://instagram.com/tdonizettiarquitetura',
  website: 'https://tdonizetti.com',
  
  // ✅ PRODUTOS ÂNCORA COM DADOS REAIS
  produtos: [
    {
      id: 'ancora_carro_50k',
      tipo: 'Carro',
      grupo: 'CD98',
      valor: 50000,
      prazo_meses: 96,
      descricao: 'Consórcio de Carro - R$ 50 mil'
    },
    {
      id: 'ancora_carro_60k',
      tipo: 'Carro',
      grupo: 'CD60',
      valor: 60000,
      prazo_meses: 88,
      descricao: 'Consórcio de Carro - R$ 60 mil'
    },
    {
      id: 'ancora_carro_70k',
      tipo: 'Carro',
      grupo: 'CD99',
      valor: 70000,
      prazo_meses: 85,
      descricao: 'Consórcio de Carro - R$ 70 mil'
    },
    {
      id: 'ancora_imovel_100k',
      tipo: 'Imóvel',
      grupo: 'I100',
      valor: 100000,
      prazo_meses: 196,
      descricao: 'Consórcio de Imóvel - R$ 100 mil'
    },
    {
      id: 'ancora_imovel_300k',
      tipo: 'Imóvel',
      grupo: 'I300',
      valor: 300000,
      prazo_meses: 197,
      descricao: 'Consórcio de Imóvel - R$ 300 mil'
    },
    {
      id: 'ancora_imovel_500k',
      tipo: 'Imóvel',
      grupo: 'I500',
      valor: 500000,
      prazo_meses: 236,
      descricao: 'Consórcio de Imóvel - R$ 500 mil'
    },
    {
      id: 'ancora_ouro_25k',
      tipo: 'Ouro 24K',
      grupo: 'OUR14',
      valor: 25000,
      prazo_meses: 89,
      descricao: 'Consórcio de Ouro - R$ 25 mil'
    }
  ],
  
  // ✅ TAXAS REAIS
  taxas_fallback: {
    selic: 14.0,
    financiamento: 9.0,
    leilao_desconto: 35
  }
};

// ============================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================

// Buscar SELIC atual do Banco Central
async function obterSelicAtualizada() {
  try {
    const response = await fetch(
      'https://www.bcb.gov.br/api/dados/v1/parametros/taxa/selic'
    );
    
    if (!response.ok) {
      console.warn('API BC indisponível, usando fallback');
      return TDONIZETTI_CONFIG.taxas_fallback.selic;
    }
    
    const data = await response.json();
    const taxa = parseFloat(data[0]?.conteudo || TDONIZETTI_CONFIG.taxas_fallback.selic);
    return taxa;
  } catch (error) {
    console.error('Erro ao buscar SELIC:', error.message);
    return TDONIZETTI_CONFIG.taxas_fallback.selic;
  }
}

// Chamar Claude API com contexto TDONIZETTI
async function analisarComClaudeAI(nome, renda, meta, perfil_risco, selic) {
  const prompt = `Você é um consultor de investimentos imobiliários especializado em Brasil, trabalhando para TDONIZETTI Investimentos.

DADOS DO INVESTIDOR:
- Nome: ${nome}
- Renda Mensal: R$ ${renda.toLocaleString('pt-BR')}
- Meta de Investimento: R$ ${meta.toLocaleString('pt-BR')}
- Perfil de Risco: ${perfil_risco === 'conservative' ? 'Conservador' : perfil_risco === 'moderate' ? 'Moderado' : 'Agressivo'}
- SELIC Atual: ${selic}% a.a.

CONTEXTO DE PRODUTOS DISPONÍVEIS (TDONIZETTI - Âncora):
${TDONIZETTI_CONFIG.produtos.map(p => 
  `• ${p.descricao}: Prazo ${p.prazo_meses} meses, Grupo ${p.grupo}`
).join('\n')}

OPÇÕES DE FINANCIAMENTO:
1. Consórcio (Âncora): Zero juros, sem dívida, construção de crédito
2. Financiamento Bancário: Taxa ${TDONIZETTI_CONFIG.taxas_fallback.financiamento}% a.a. (Banco Inter)
3. Leilão Judicial: Imóvel com ~${TDONIZETTI_CONFIG.taxas_fallback.leilao_desconto}% desconto, requer capital

ANÁLISE SOLICITADA:
1. Diagnóstico claro do perfil do investidor e situação financeira
2. 3-4 recomendações específicas (qual tipo de produto é melhor e POR QUÊ)
3. Cálculo do prazo estimado até atingir a meta
4. Próximos passos práticos e realistas
5. Por que cada recomendação é ideal para ESTE investidor específico

IMPORTANTE:
- Use linguagem CLARA, didática e inspiradora
- Seja ESPECÍFICO com números e prazos
- Inclua estimativas realistas
- Finalize indicando que um especialista TDONIZETTI entará em contato

Responda em Markdown estruturado.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Erro Claude API:', error.message);
    throw error;
  }
}

// Salvar lead em Supabase
async function salvarLead(nome, email, renda, meta, perfil_risco, analise) {
  try {
    const { data, error } = await supabase
      .from('investeai_leads')
      .insert([
        {
          nome,
          email,
          renda,
          meta,
          perfil_risco,
          analise,
          status: 'novo',
          criado_em: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Erro ao salvar lead:', error.message);
    throw error;
  }
}

// Enviar análise por Make.com (WhatsApp)
async function enviarWhatsApp(nome, email) {
  if (!process.env.MAKE_WEBHOOK_URL) {
    console.warn('MAKE_WEBHOOK_URL não configurado, pulando WhatsApp');
    return;
  }

  try {
    const payload = {
      nome,
      email,
      whatsapp: TDONIZETTI_CONFIG.whatsapp,
      timestamp: new Date().toISOString()
    };

    await fetch(process.env.MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Notificação WhatsApp enviada via Make.com');
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error.message);
  }
}

// Enviar email com análise (via Resend)
async function enviarEmailComAnalise(nome, email, analise) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY não configurado, pulando email');
    return;
  }

  try {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { color: #1D9E75; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
    .subheader { color: #666; font-size: 16px; margin-bottom: 30px; }
    .analysis { background: #f8f9fa; padding: 20px; border-left: 4px solid #1D9E75; margin: 20px 0; line-height: 1.6; }
    .cta { background: #1D9E75; color: white; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0; }
    .cta a { color: white; text-decoration: none; display: inline-block; margin-top: 10px; }
    .footer { color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
    .footer a { color: #1D9E75; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">💰 Sua Análise de Investimento Imobiliário está Pronta!</div>
    <div class="subheader">Olá ${nome},</div>
    
    <p>Fizemos uma análise completa e personalizada do seu perfil de investimento imobiliário. Confira os detalhes abaixo:</p>
    
    <div class="analysis">
      ${analise.replace(/\n/g, '<br>')}
    </div>
    
    <div class="cta">
      <p style="margin: 0; font-size: 16px;"><strong>Próximos Passos</strong></p>
      <p style="font-size: 14px; margin: 10px 0;">Um especialista TDONIZETTI entrará em contato para detalhar sua melhor estratégia de investimento.</p>
      <a href="https://wa.me/5511937491873?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20minha%20análise%20de%20investimento%20imobiliário" style="display: inline-block; background: white; color: #1D9E75; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
        💬 Fale conosco no WhatsApp
      </a>
    </div>
    
    <p>Se tiver dúvidas, não hesite em entrar em contato!</p>
    
    <div class="footer">
      <p><strong>TDONIZETTI Investimentos</strong></p>
      <p>
        📱 WhatsApp: <a href="https://wa.me/5511937491873">+55 11 93749-1873</a><br>
        📧 Email: <a href="mailto:${TDONIZETTI_CONFIG.email}">${TDONIZETTI_CONFIG.email}</a><br>
        📍 Website: <a href="https://tdonizetti.com">tdonizetti.com</a><br>
        📸 Instagram: <a href="https://instagram.com/tdonizettiarquitetura">@tdonizettiarquitetura</a>
      </p>
      <p>© 2024 TDONIZETTI. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: `InvesteAI <noreply@investeai.com.br>`,
        to: email,
        subject: `Sua Análise de Investimento Imobiliário - ${nome}`,
        html: htmlContent
      })
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status}`);
    }

    console.log('Email enviado com sucesso');
  } catch (error) {
    console.error('Erro ao enviar email:', error.message);
  }
}

// ============================================================
// ROTAS
// ============================================================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Buscar SELIC (público)
app.get('/api/selic', async (req, res) => {
  try {
    const selic = await obterSelicAtualizada();
    res.json({ selic, fonte: 'Banco Central do Brasil' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar produtos Âncora (público)
app.get('/api/produtos', (req, res) => {
  res.json(TDONIZETTI_CONFIG.produtos);
});

// Obter config pública (público)
app.get('/api/config', (req, res) => {
  res.json({
    whatsapp: TDONIZETTI_CONFIG.whatsapp,
    instagram: TDONIZETTI_CONFIG.instagram,
    website: TDONIZETTI_CONFIG.website,
    email: TDONIZETTI_CONFIG.email
  });
});

// ⭐ ROTA PRINCIPAL - Analisar perfil de investidor
app.post('/api/analisar', async (req, res) => {
  try {
    const { nome, email, renda, meta, perfil_risco } = req.body;

    // Validação
    if (!nome || !email || !renda || !meta) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    console.log(`🔄 Analisando perfil: ${nome} (${email})`);

    // 1. Obter SELIC
    const selic = await obterSelicAtualizada();
    console.log(`✓ SELIC obtida: ${selic}%`);

    // 2. Gerar análise via Claude
    const analise = await analisarComClaudeAI(nome, renda, meta, perfil_risco, selic);
    console.log(`✓ Análise gerada pelo Claude`);

    // 3. Salvar lead em Supabase
    const lead = await salvarLead(nome, email, renda, meta, perfil_risco, analise);
    console.log(`✓ Lead salvo: ${lead.id}`);

    // 4. Enviar email
    await enviarEmailComAnalise(nome, email, analise);
    console.log(`✓ Email enviado`);

    // 5. Disparar webhook Make.com (WhatsApp)
    await enviarWhatsApp(nome, email);
    console.log(`✓ Notificação WhatsApp disparada`);

    // Retornar resposta
    res.json({
      success: true,
      analise,
      lead_id: lead.id,
      mensagem: 'Análise enviada com sucesso! Verifique seu email.'
    });

  } catch (error) {
    console.error('❌ Erro em /api/analisar:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// SERVER START
// ============================================================

app.listen(port, () => {
  console.log(`\n🚀 InvesteAI Backend rodando!`);
  console.log(`📍 Porta: ${port}`);
  console.log(`📊 Produtos Âncora: ${TDONIZETTI_CONFIG.produtos.length}`);
  console.log(`💚 SELIC: ${TDONIZETTI_CONFIG.taxas_fallback.selic}%`);
  console.log(`📱 WhatsApp: ${TDONIZETTI_CONFIG.whatsapp}`);
  console.log(`✅ Supabase: ${supabaseUrl ? 'Conectado' : 'Erro'}`);
  console.log('\n');
});

export default app;
