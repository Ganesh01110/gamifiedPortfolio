terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
  team_id   = var.vercel_team_id
}

variable "vercel_api_token" {
  description = "Vercel API Token"
  type        = string
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel Team/Org ID"
  type        = string
}

variable "vercel_project_id" {
  description = "Vercel Project ID"
  type        = string
}

resource "vercel_project" "portfolio" {
  name      = "gamified-portfolio-devops"
  framework = "nextjs"
  
  git_repository = {
    type = "github"
    repo = "Ganesh01110/gamifiedPortfolio"
  }
}

resource "vercel_deployment" "production" {
  project_id = var.vercel_project_id
  production = true
}

output "production_url" {
  value = vercel_deployment.production.url
}
