#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Env};

#[test]
fn test_create_campaign() {
    let env = Env::default();
    env.mock_all_auths();

    // Register contract
    let contract_id = env.register_contract(None, BuyMeACoffeeContract);
    let client = BuyMeACoffeeContractClient::new(&env, &contract_id);

    // Initialize
    let admin = Address::generate(&env);
    client.initialize(&admin);

    // Create Campaign
    let owner = Address::generate(&env);
    let name = String::from_str(&env, "Help Me");
    let target = 1000i128;
    let deadline = env.ledger().timestamp() + 1000;
    
    let campaign_id = client.create_campaign(&name, &target, &deadline, &owner);
    assert_eq!(campaign_id, 1);

    // Verify Campaign
    let campaign = client.get_campaign(&campaign_id);
    assert_eq!(campaign.name, name);
    assert_eq!(campaign.target, target);
    assert_eq!(campaign.owner, owner);
    assert_eq!(campaign.active, true);
    assert_eq!(campaign.balance, 0);
}
